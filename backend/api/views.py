from rest_framework import status, generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import get_user_model
from django.contrib.contenttypes.models import ContentType
from django.db.models import Q
from .models import (
    JoinableTripPost, JoinableTripImage, TripJoinRequest,
    TripGroup, TripGroupMember, ExperiencePost, ExperienceDay,
    ExperienceDayImage, GeneralPost, GeneralPostImage,
    Like, Comment, SavedPost, Message, Notification, Follow
)
from .serializers import (
    UserSerializer, RegisterSerializer, JoinableTripPostSerializer,
    TripJoinRequestSerializer, TripGroupSerializer, ExperiencePostSerializer,
    ExperienceDaySerializer, ExperienceDayImageSerializer, GeneralPostSerializer,
    CommentSerializer, MessageSerializer, NotificationSerializer
)

User = get_user_model()


class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({'message': 'User registered successfully'}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

    def patch(self, request):
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, username):
        try:
            user = User.objects.get(username=username)
            serializer = UserSerializer(user)
            return Response(serializer.data)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)


class FollowToggleView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, user_id):
        try:
            target = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

        if target == request.user:
            return Response({'error': 'You cannot follow yourself'}, status=status.HTTP_400_BAD_REQUEST)

        follow, created = Follow.objects.get_or_create(follower=request.user, following=target)

        if not created:
            follow.delete()
            return Response({'status': 'unfollowed'})

        Notification.objects.create(
            sender=request.user,
            receiver=target,
            notification_type='follow'
        )
        return Response({'status': 'followed'})


class IsFollowingView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, user_id):
        is_following = Follow.objects.filter(follower=request.user, following_id=user_id).exists()
        return Response({'is_following': is_following})


class MatesListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        following_ids = Follow.objects.filter(follower=request.user).values_list('following_id', flat=True)
        follower_ids = Follow.objects.filter(following=request.user).values_list('follower_id', flat=True)
        mate_ids = set(following_ids) & set(follower_ids)
        mates = User.objects.filter(id__in=mate_ids)
        serializer = UserSerializer(mates, many=True)
        return Response(serializer.data)


class ExperiencePostListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        posts = ExperiencePost.objects.all().order_by('-created_at')
        serializer = ExperiencePostSerializer(posts, many=True, context={'request': request})
        return Response(serializer.data)

    def post(self, request):
        serializer = ExperiencePostSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save(author=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ExperiencePostDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        try:
            post = ExperiencePost.objects.get(pk=pk)
            serializer = ExperiencePostSerializer(post, context={'request': request})
            return Response(serializer.data)
        except ExperiencePost.DoesNotExist:
            return Response({'error': 'Post not found'}, status=status.HTTP_404_NOT_FOUND)


class ExperienceDayListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, post_id):
        days = ExperienceDay.objects.filter(post_id=post_id)
        serializer = ExperienceDaySerializer(days, many=True)
        return Response(serializer.data)

    def post(self, request, post_id):
        try:
            post = ExperiencePost.objects.get(pk=post_id, author=request.user)
        except ExperiencePost.DoesNotExist:
            return Response({'error': 'Post not found'}, status=status.HTTP_404_NOT_FOUND)

        serializer = ExperienceDaySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(post=post)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ExperienceDayImageUploadView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, day_id):
        try:
            day = ExperienceDay.objects.get(pk=day_id)
        except ExperienceDay.DoesNotExist:
            return Response({'error': 'Day not found'}, status=status.HTTP_404_NOT_FOUND)

        images = request.FILES.getlist('images')
        created = []
        for image in images:
            obj = ExperienceDayImage.objects.create(day=day, image=image)
            created.append(ExperienceDayImageSerializer(obj).data)
        return Response(created, status=status.HTTP_201_CREATED)


class JoinableTripListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        trips = JoinableTripPost.objects.all().order_by('-created_at')
        serializer = JoinableTripPostSerializer(trips, many=True, context={'request': request})
        return Response(serializer.data)

    def post(self, request):
        serializer = JoinableTripPostSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save(creator=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class JoinableTripDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        try:
            trip = JoinableTripPost.objects.get(pk=pk)
            serializer = JoinableTripPostSerializer(trip, context={'request': request})
            return Response(serializer.data)
        except JoinableTripPost.DoesNotExist:
            return Response({'error': 'Trip not found'}, status=status.HTTP_404_NOT_FOUND)


class TripJoinRequestView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, trip_id):
        try:
            trip = JoinableTripPost.objects.get(pk=trip_id)
        except JoinableTripPost.DoesNotExist:
            return Response({'error': 'Trip not found'}, status=status.HTTP_404_NOT_FOUND)

        join_request, created = TripJoinRequest.objects.get_or_create(user=request.user, trip=trip)
        if not created:
            return Response({'message': 'Already requested'}, status=status.HTTP_400_BAD_REQUEST)
        return Response(TripJoinRequestSerializer(join_request).data, status=status.HTTP_201_CREATED)


class TripJoinRequestApproveView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, request_id):
        try:
            join_request = TripJoinRequest.objects.get(pk=request_id, trip__creator=request.user)
        except TripJoinRequest.DoesNotExist:
            return Response({'error': 'Request not found'}, status=status.HTTP_404_NOT_FOUND)

        join_request.status = 'accepted'
        join_request.save()
        return Response({'message': 'Request accepted'})


class LikeToggleView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, model_name, pk):
        model_map = {
            'experience': ExperiencePost,
            'general': GeneralPost,
            'joinable': JoinableTripPost,
        }
        model = model_map.get(model_name)
        if not model:
            return Response({'error': 'Invalid post type'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            obj = model.objects.get(pk=pk)
        except model.DoesNotExist:
            return Response({'error': 'Post not found'}, status=status.HTTP_404_NOT_FOUND)

        ct = ContentType.objects.get_for_model(obj)
        like, created = Like.objects.get_or_create(user=request.user, content_type=ct, object_id=obj.id)

        if not created:
            like.delete()
            liked = False
        else:
            liked = True

        total_likes = Like.objects.filter(content_type=ct, object_id=obj.id).count()
        return Response({'liked': liked, 'total_likes': total_likes})


class SaveToggleView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, model_name, pk):
        model_map = {
            'experience': ExperiencePost,
            'general': GeneralPost,
            'joinable': JoinableTripPost,
        }
        model = model_map.get(model_name)
        if not model:
            return Response({'error': 'Invalid post type'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            obj = model.objects.get(pk=pk)
        except model.DoesNotExist:
            return Response({'error': 'Post not found'}, status=status.HTTP_404_NOT_FOUND)

        ct = ContentType.objects.get_for_model(obj)
        saved_post, created = SavedPost.objects.get_or_create(user=request.user, content_type=ct, object_id=obj.id)

        if not created:
            saved_post.delete()
            return Response({'saved': False})
        return Response({'saved': True})


class CommentListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, model_name, pk):
        model_map = {
            'experience': ExperiencePost,
            'general': GeneralPost,
            'joinable': JoinableTripPost,
        }
        model = model_map.get(model_name)
        if not model:
            return Response({'error': 'Invalid post type'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            obj = model.objects.get(pk=pk)
        except model.DoesNotExist:
            return Response({'error': 'Post not found'}, status=status.HTTP_404_NOT_FOUND)

        ct = ContentType.objects.get_for_model(obj)
        comments = Comment.objects.filter(content_type=ct, object_id=obj.id).order_by('-created_at')
        serializer = CommentSerializer(comments, many=True)
        return Response(serializer.data)

    def post(self, request, model_name, pk):
        model_map = {
            'experience': ExperiencePost,
            'general': GeneralPost,
            'joinable': JoinableTripPost,
        }
        model = model_map.get(model_name)
        if not model:
            return Response({'error': 'Invalid post type'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            obj = model.objects.get(pk=pk)
        except model.DoesNotExist:
            return Response({'error': 'Post not found'}, status=status.HTTP_404_NOT_FOUND)

        ct = ContentType.objects.get_for_model(obj)
        comment = Comment.objects.create(
            user=request.user,
            content_type=ct,
            object_id=obj.id,
            text=request.data.get('text', '')
        )
        return Response(CommentSerializer(comment).data, status=status.HTTP_201_CREATED)


class ForYouFeedView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        experience_posts = ExperiencePostSerializer(
            ExperiencePost.objects.all().order_by('-created_at')[:20],
            many=True, context={'request': request}
        ).data
        return Response(experience_posts)


class FollowingFeedView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        following_ids = Follow.objects.filter(follower=request.user).values_list('following_id', flat=True)
        posts = ExperiencePost.objects.filter(author_id__in=following_ids).order_by('-created_at')
        serializer = ExperiencePostSerializer(posts, many=True, context={'request': request})
        return Response(serializer.data)


class SearchView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        query = request.query_params.get('q', '')
        if not query:
            return Response({'users': [], 'posts': []})

        users = User.objects.filter(
            Q(username__icontains=query) | Q(full_name__icontains=query)
        )[:10]

        posts = ExperiencePost.objects.filter(
            Q(title__icontains=query)
        )[:10]

        return Response({
            'users': UserSerializer(users, many=True).data,
            'posts': ExperiencePostSerializer(posts, many=True, context={'request': request}).data
        })


class ConversationListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        messages = Message.objects.filter(
            Q(sender=request.user) | Q(receiver=request.user)
        ).order_by('-created_at')

        seen = set()
        conversations = []
        for msg in messages:
            other = msg.receiver if msg.sender == request.user else msg.sender
            if other.id not in seen:
                seen.add(other.id)
                conversations.append({
                    'id': other.id,
                    'user': UserSerializer(other).data,
                    'last_message': msg.content
                })
        return Response(conversations)


class ChatView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, user_id):
        messages = Message.objects.filter(
            Q(sender=request.user, receiver_id=user_id) |
            Q(sender_id=user_id, receiver=request.user)
        ).order_by('created_at')
        serializer = MessageSerializer(messages, many=True, context={'request': request})
        return Response(serializer.data)

    def post(self, request, user_id):
        try:
            receiver = User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

        message = Message.objects.create(
            sender=request.user,
            receiver=receiver,
            content=request.data.get('content', '')
        )
        return Response(MessageSerializer(message, context={'request': request}).data, status=status.HTTP_201_CREATED)


class NotificationListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        notifications = Notification.objects.filter(receiver=request.user).order_by('-created_at')
        serializer = NotificationSerializer(notifications, many=True)
        return Response(serializer.data)


class MarkAllNotificationsReadView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        Notification.objects.filter(receiver=request.user, is_read=False).update(is_read=True)
        return Response({'message': 'All notifications marked as read'})


class SavedPostsListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        saved = SavedPost.objects.filter(user=request.user).order_by('-saved_at')
        posts = []
        for item in saved:
            obj = item.content_object
            if isinstance(obj, ExperiencePost):
                posts.append(ExperiencePostSerializer(obj, context={'request': request}).data)
        return Response(posts)


class UserPostsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, username):
        try:
            user = User.objects.get(username=username)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

        posts = ExperiencePost.objects.filter(author=user).order_by('-created_at')
        serializer = ExperiencePostSerializer(posts, many=True, context={'request': request})
        return Response(serializer.data)
    
class GeneralPostListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        posts = GeneralPost.objects.all().order_by('-created_at')
        serializer = GeneralPostSerializer(posts, many=True, context={'request': request})
        return Response(serializer.data)

    def post(self, request):
        description = request.data.get('description', '')
        post = GeneralPost.objects.create(author=request.user, description=description)
        images = request.FILES.getlist('images')
        for image in images:
            GeneralPostImage.objects.create(post=post, image=image)
        serializer = GeneralPostSerializer(post, context={'request': request})
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class JoinableTripInterestView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, trip_id):
        try:
            trip = JoinableTripPost.objects.get(pk=trip_id)
        except JoinableTripPost.DoesNotExist:
            return Response({'error': 'Trip not found'}, status=status.HTTP_404_NOT_FOUND)

        if trip.creator == request.user:
            return Response({'error': 'You cannot join your own trip'}, status=status.HTTP_400_BAD_REQUEST)

        join_request, created = TripJoinRequest.objects.get_or_create(
            user=request.user,
            trip=trip
        )

        if not created:
            return Response({'message': 'Already requested', 'status': join_request.status})

        return Response(TripJoinRequestSerializer(join_request).data, status=status.HTTP_201_CREATED)


class JoinableTripRequestsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, trip_id):
        try:
            trip = JoinableTripPost.objects.get(pk=trip_id, creator=request.user)
        except JoinableTripPost.DoesNotExist:
            return Response({'error': 'Trip not found'}, status=status.HTTP_404_NOT_FOUND)

        requests = TripJoinRequest.objects.filter(trip=trip, status='pending')
        serializer = TripJoinRequestSerializer(requests, many=True)
        return Response(serializer.data)


class JoinableTripAcceptView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, request_id):
        try:
            join_request = TripJoinRequest.objects.get(pk=request_id, trip__creator=request.user)
        except TripJoinRequest.DoesNotExist:
            return Response({'error': 'Request not found'}, status=status.HTTP_404_NOT_FOUND)

        join_request.status = 'accepted'
        join_request.save()

        group, _ = TripGroup.objects.get_or_create(
            trip=join_request.trip,
            defaults={'name': f"{join_request.trip.title} Group"}
        )
        group.members.add(join_request.user)
        group.members.add(join_request.trip.creator)

        return Response({'message': 'Request accepted', 'group_id': group.id})

class JoinableTripRejectView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, request_id):
        try:
            join_request = TripJoinRequest.objects.get(pk=request_id, trip__creator=request.user)
        except TripJoinRequest.DoesNotExist:
            return Response({'error': 'Request not found'}, status=status.HTTP_404_NOT_FOUND)

        join_request.status = 'rejected'
        join_request.save()
        return Response({'message': 'Request rejected'})

class UserSearchForMessageView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        query = request.query_params.get('q', '')
        if not query:
            return Response([])
        users = User.objects.filter(
            Q(username__icontains=query)
        ).exclude(id=request.user.id)[:10]
        serializer = UserSerializer(users, many=True)
        return Response(serializer.data)