# backend/api/views.py
# backend/api/views.py
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from .models import Profile, Post, TripDay, DayPhoto, User
from .serializers import (
    UserSerializer,
    ProfileSerializer,
    ProfileUpdateSerializer,
    PostSerializer,
    TripDaySerializer,
    DayPhotoSerializer
)
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from .models import Post, Like, SavedPost, Comment, Follow, TripJoinRequest, Notification, Message
from .serializers import PostSerializer, CommentSerializer
from rest_framework.decorators import api_view, permission_classes

# --- User and Profile Views (no change) ---
from rest_framework import viewsets, status
from rest_framework.decorators import action

from django.db.models import Q
from django.contrib.auth.models import User

from .models import (
    Follow, Post, TripJoinRequest, Notification, Message
)
from .serializers import (
    FollowSerializer, PostSerializer, TripJoinRequestSerializer,
    NotificationSerializer, MessageSerializer, UserSerializer
)


# =====================================================
# 1️⃣  MATES (Mutual Follows)
# =====================================================
class FollowViewSet(viewsets.ModelViewSet):
    queryset = Follow.objects.all()
    serializer_class = FollowSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(follower=self.request.user)

    @action(detail=False, methods=['get'])
    def mates(self, request):
        """Return mutual follows (mates)."""
        user = request.user
        following_ids = Follow.objects.filter(follower=user).values_list('following', flat=True)
        followers_ids = Follow.objects.filter(following=user).values_list('follower', flat=True)
        mutual_ids = set(following_ids).intersection(set(followers_ids))
        mates = User.objects.filter(id__in=mutual_ids)
        serializer = UserSerializer(mates, many=True)
        return Response(serializer.data)


# =====================================================
# 2️⃣  POSTS / JOINABLE TRIPS
# =====================================================
class PostViewSet(viewsets.ModelViewSet):
    queryset = Post.objects.all().order_by('-created_at')
    serializer_class = PostSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

    @action(detail=False, methods=['get'])
    def joinable(self, request):
        """Return all joinable trips (is_joinable=True)."""
        joinable = Post.objects.filter(is_joinable=True)
        serializer = PostSerializer(joinable, many=True)
        return Response(serializer.data)


# =====================================================
# 3️⃣  JOIN REQUESTS (Trip Join + Approvals)
# =====================================================
class TripJoinRequestViewSet(viewsets.ModelViewSet):
    queryset = TripJoinRequest.objects.all().select_related('post', 'user')
    serializer_class = TripJoinRequestSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        """Create a join request."""
        serializer.save(user=self.request.user)

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """Approve a user's join request (only trip creator can approve)."""
        join_request = self.get_object()
        if join_request.post.author != request.user:
            return Response({'error': 'Only the trip creator can approve requests.'},
                            status=status.HTTP_403_FORBIDDEN)
        join_request.is_approved = True
        join_request.save()
        return Response({'message': f"{join_request.user.username} added to {join_request.post.title} group."})


# =====================================================
# 4️⃣  NOTIFICATIONS
# =====================================================
class NotificationViewSet(viewsets.ModelViewSet):
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Return notifications for logged-in user."""
        return Notification.objects.filter(user=self.request.user).order_by('-created_at')

    @action(detail=False, methods=['post'])
    def mark_all_read(self, request):
        """Mark all notifications as read."""
        Notification.objects.filter(user=request.user, is_read=False).update(is_read=True)
        return Response({'message': 'All notifications marked as read.'})


# =====================================================
# 5️⃣  MESSAGES (Chat)
# =====================================================
class MessageViewSet(viewsets.ModelViewSet):
    serializer_class = MessageSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Return messages involving the logged-in user."""
        user = self.request.user
        return Message.objects.filter(
            Q(sender=user) | Q(receiver=user)
        ).order_by('timestamp')

    def perform_create(self, serializer):
        """Send a message."""
        serializer.save(sender=self.request.user)

    @action(detail=False, methods=['get'])
    def trip_chat(self, request):
        """Get group messages for a specific trip."""
        post_id = request.query_params.get('post_id')
        if not post_id:
            return Response({'error': 'post_id required'}, status=status.HTTP_400_BAD_REQUEST)
        messages = Message.objects.filter(post_id=post_id).order_by('timestamp')
        serializer = self.get_serializer(messages, many=True)
        return Response(serializer.data)


class ToggleLikeView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        post = Post.objects.get(pk=pk)
        like, created = Like.objects.get_or_create(user=request.user, post=post)
        if not created:
            like.delete()
            return Response({"message": "Post unliked"}, status=status.HTTP_200_OK)
        return Response({"message": "Post liked"}, status=status.HTTP_201_CREATED)
class ToggleSaveView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            post = Post.objects.get(pk=pk)
        except Post.DoesNotExist:
            return Response({"error": "Post not found"}, status=status.HTTP_404_NOT_FOUND)

        saved, created = SavedPost.objects.get_or_create(user=request.user, post=post)
        if not created:
            saved.delete()
            return Response({"message": "Post unsaved"}, status=status.HTTP_200_OK)
        return Response({"message": "Post saved"}, status=status.HTTP_201_CREATED)

class SavedPostListView(generics.ListAPIView):
    serializer_class = PostSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Post.objects.filter(saves__user=self.request.user)


# --- Comments ---
class CommentListCreateView(generics.ListCreateAPIView):
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Comment.objects.filter(post_id=self.kwargs['pk']).order_by('-created_at')

    def perform_create(self, serializer):
        post = Post.objects.get(pk=self.kwargs['pk'])
        serializer.save(user=self.request.user, post=post)

class CreateUserView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [] # Allow any user to create an account

class ProfileView(generics.RetrieveAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user

class ProfileUpdateView(generics.UpdateAPIView):
    serializer_class = ProfileUpdateSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def get_object(self):
        profile, created = Profile.objects.get_or_create(user=self.request.user)
        return self.request.user.profile

# --- NEW Trip and Day Views ---

# Handles listing a user's trips and creating a new one
class PostListCreateView(generics.ListCreateAPIView):
    serializer_class = PostSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Post.objects.filter(author=self.request.user)

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

# Handles retrieving, updating, and deleting a single trip
class PostRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = PostSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Post.objects.filter(author=self.request.user)

# Handles adding a new day to a specific trip
class TripDayCreateView(generics.CreateAPIView):
    serializer_class = TripDaySerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        post = Post.objects.get(pk=self.kwargs['post_pk'], author=self.request.user)
        serializer.save(post=post)

# Handles uploading a photo to a specific day of a trip
class DayPhotoCreateView(generics.CreateAPIView):
    serializer_class = DayPhotoSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def perform_create(self, serializer):
        trip_day = TripDay.objects.get(pk=self.kwargs['day_pk'])
        # Security check: Ensure the day belongs to a post owned by the user
        if trip_day.post.author == self.request.user:
            serializer.save(trip_day=trip_day)
        else:
            # Handle permission denied
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("You do not have permission to add photos to this trip day.")