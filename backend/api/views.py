from django.db.models import Q
from django.contrib.auth.models import User
from rest_framework import generics, viewsets, status
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAuthenticatedOrReadOnly
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.authentication import BasicAuthentication
from rest_framework_simplejwt.authentication import JWTAuthentication

from .models import (
    Profile, Post, TripDay, DayPhoto, Like, SavedPost,
    Comment, Follow, TripJoinRequest, Notification, Message
)
from .serializers import (
    UserSerializer, ProfileSerializer, ProfileUpdateSerializer,
    PostSerializer, TripDaySerializer, DayPhotoSerializer,
    CommentSerializer, FollowSerializer, TripJoinRequestSerializer,
    NotificationSerializer, MessageSerializer
)

# =====================================================
# 🔹 USER REGISTRATION
# =====================================================
class RegisterView(APIView):
    authentication_classes = [BasicAuthentication]
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get("username")
        email = request.data.get("email")
        password = request.data.get("password")

        if not username or not password:
            return Response({"error": "Username and password are required"},
                            status=status.HTTP_400_BAD_REQUEST)

        if User.objects.filter(username=username).exists():
            return Response({"error": "Username already exists"},
                            status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.create_user(username=username, email=email, password=password)
        Profile.objects.get_or_create(user=user)
        return Response({"message": "User created successfully", "username": user.username},
                        status=status.HTTP_201_CREATED)


# =====================================================
# 🔹 PROFILE
# =====================================================
class ProfileView(generics.RetrieveAPIView):
    
    serializer_class = ProfileSerializer
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def get_object(self):
        profile, _ = Profile.objects.get_or_create(user=self.request.user)
        return profile


class ProfileUpdateView(generics.UpdateAPIView):
    serializer_class = ProfileUpdateSerializer
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]
    parser_classes = [MultiPartParser, FormParser]

    def get_object(self):
        profile, _ = Profile.objects.get_or_create(user=self.request.user)
        return profile


# =====================================================
# 🔹 POSTS
# =====================================================
class PostListCreateView(generics.ListCreateAPIView):
    serializer_class = PostSerializer
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def get_queryset(self):
        return Post.objects.filter(author=self.request.user)

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)


class PostRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = PostSerializer
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def get_queryset(self):
        return Post.objects.filter(author=self.request.user)


# =====================================================
# 🔹 TRIP DAY & PHOTOS
# =====================================================
class TripDayCreateView(generics.CreateAPIView):
    serializer_class = TripDaySerializer
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def perform_create(self, serializer):
        post = Post.objects.get(pk=self.kwargs["post_pk"], author=self.request.user)
        serializer.save(post=post)


class DayPhotoCreateView(generics.CreateAPIView):
    serializer_class = DayPhotoSerializer
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]
    parser_classes = [MultiPartParser, FormParser]

    def perform_create(self, serializer):
        trip_day = TripDay.objects.get(pk=self.kwargs["day_pk"])
        if trip_day.post.author != self.request.user:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("You do not have permission to add photos to this trip day.")
        serializer.save(trip_day=trip_day)


# =====================================================
# 🔹 FEEDS
# =====================================================
class ForYouFeedView(generics.ListAPIView):
    serializer_class = PostSerializer
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def get_queryset(self):
        return Post.objects.all().order_by("-created_at")


class FollowingFeedView(generics.ListAPIView):
    serializer_class = PostSerializer
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def get_queryset(self):
        user = self.request.user
        following_users = user.following.values_list("following", flat=True)
        return Post.objects.filter(author__id__in=following_users).order_by("-created_at")


# =====================================================
# 🔹 SEARCH
# =====================================================
class SearchView(APIView):
    permission_classes = [IsAuthenticatedOrReadOnly]
    authentication_classes = [JWTAuthentication]

    def get(self, request):
        query = request.GET.get("q", "").strip()
        if not query:
            return Response({"results": []})

        users = User.objects.filter(Q(username__icontains=query)).distinct()
        posts = Post.objects.filter(
            Q(title__icontains=query) | Q(location_summary__icontains=query)
        ).distinct()

        user_data = UserSerializer(users, many=True, context={"request": request}).data
        post_data = PostSerializer(posts, many=True, context={"request": request}).data

        return Response({"results": user_data + post_data})


# =====================================================
# 🔹 FOLLOW SYSTEM
# =====================================================
class FollowViewSet(viewsets.ModelViewSet):
    queryset = Follow.objects.all()
    serializer_class = FollowSerializer
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def perform_create(self, serializer):
        follow_instance = serializer.save(follower=self.request.user)
        if Follow.objects.filter(
            follower=follow_instance.following, following=self.request.user, is_accepted=True
        ).exists():
            follow_instance.is_accepted = True
            follow_instance.save()
            Notification.objects.create(
                user=follow_instance.following,
                sender=self.request.user,
                text=f"{self.request.user.username} followed you back."
            )
        else:
            Notification.objects.create(
                user=follow_instance.following,
                sender=self.request.user,
                text=f"{self.request.user.username} sent you a follow request."
            )

    @action(detail=True, methods=["post"])
    def accept(self, request, pk=None):
        follow = self.get_object()
        if follow.following != request.user:
            return Response({"error": "You cannot accept this request."}, status=403)
        follow.is_accepted = True
        follow.save()
        Notification.objects.create(
            user=follow.follower,
            sender=request.user,
            text=f"{request.user.username} accepted your follow request."
        )
        return Response({"status": "accepted"})


# =====================================================
# 🔹 JOIN REQUESTS
# =====================================================
class TripJoinRequestViewSet(viewsets.ModelViewSet):
    queryset = TripJoinRequest.objects.all().select_related("post", "user")
    serializer_class = TripJoinRequestSerializer
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


# =====================================================
# 🔹 NOTIFICATIONS
# =====================================================
class NotificationViewSet(viewsets.ModelViewSet):
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user).order_by("-created_at")


# =====================================================
# 🔹 MESSAGES
# =====================================================
class MessageViewSet(viewsets.ModelViewSet):
    serializer_class = MessageSerializer
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def get_queryset(self):
        user = self.request.user
        return Message.objects.filter(Q(sender=user) | Q(receiver=user)).order_by("timestamp")

    def perform_create(self, serializer):
        serializer.save(sender=self.request.user)


# =====================================================
# 🔹 LIKE / SAVE / COMMENTS
# =====================================================
class ToggleLikeView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def post(self, request, pk):
        post = Post.objects.get(pk=pk)
        like, created = Like.objects.get_or_create(user=request.user, post=post)
        if not created:
            like.delete()
            return Response({"message": "Post unliked"})
        return Response({"message": "Post liked"})


class ToggleSaveView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def post(self, request, pk):
        try:
            post = Post.objects.get(pk=pk)
        except Post.DoesNotExist:
            return Response({"error": "Post not found"}, status=status.HTTP_404_NOT_FOUND)
        saved, created = SavedPost.objects.get_or_create(user=request.user, post=post)
        if not created:
            saved.delete()
            return Response({"message": "Post unsaved"})
        return Response({"message": "Post saved"})


class SavedPostListView(generics.ListAPIView):
    serializer_class = PostSerializer
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def get_queryset(self):
        return Post.objects.filter(saves__user=self.request.user)


class CommentListCreateView(generics.ListCreateAPIView):
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def get_queryset(self):
        return Comment.objects.filter(post_id=self.kwargs["pk"]).order_by("-created_at")

    def perform_create(self, serializer):
        post = Post.objects.get(pk=self.kwargs["pk"])
        serializer.save(user=self.request.user, post=post)
