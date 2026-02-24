from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import (
    JoinableTripPost, JoinableTripImage, TripJoinRequest,
    TripGroup, TripGroupMember, ExperiencePost, ExperienceDay,
    ExperienceDayImage, GeneralPost, GeneralPostImage,
    Like, Comment, SavedPost, Message, Notification, Follow
)

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'full_name', 'profile_pic', 'cover_pic', 'bio']


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password']

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        return user


class FollowSerializer(serializers.ModelSerializer):
    class Meta:
        model = Follow
        fields = ['id', 'follower', 'following', 'created_at']


class JoinableTripImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = JoinableTripImage
        fields = ['id', 'image']


class JoinableTripPostSerializer(serializers.ModelSerializer):
    images = JoinableTripImageSerializer(many=True, read_only=True)
    creator = UserSerializer(read_only=True)
    is_liked = serializers.SerializerMethodField()
    is_saved = serializers.SerializerMethodField()
    total_likes = serializers.SerializerMethodField()

    class Meta:
        model = JoinableTripPost
        fields = [
            'id', 'creator', 'title', 'destination', 'budget',
            'start_date', 'end_date', 'details', 'min_members',
            'max_members', 'status', 'images', 'created_at',
            'is_liked', 'is_saved', 'total_likes'
        ]

    def get_is_liked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            from django.contrib.contenttypes.models import ContentType
            ct = ContentType.objects.get_for_model(obj)
            return Like.objects.filter(user=request.user, content_type=ct, object_id=obj.id).exists()
        return False

    def get_is_saved(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            from django.contrib.contenttypes.models import ContentType
            ct = ContentType.objects.get_for_model(obj)
            return SavedPost.objects.filter(user=request.user, content_type=ct, object_id=obj.id).exists()
        return False

    def get_total_likes(self, obj):
        from django.contrib.contenttypes.models import ContentType
        ct = ContentType.objects.get_for_model(obj)
        return Like.objects.filter(content_type=ct, object_id=obj.id).count()


class TripJoinRequestSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = TripJoinRequest
        fields = ['id', 'user', 'trip', 'status', 'created_at']


class TripGroupMemberSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = TripGroupMember
        fields = ['id', 'user', 'role', 'joined_at']


class TripGroupSerializer(serializers.ModelSerializer):
    members = TripGroupMemberSerializer(source='group_memberships', many=True, read_only=True)

    class Meta:
        model = TripGroup
        fields = ['id', 'name', 'trip', 'members', 'created_at']


class ExperienceDayImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExperienceDayImage
        fields = ['id', 'image', 'caption']


class ExperienceDaySerializer(serializers.ModelSerializer):
    photos = ExperienceDayImageSerializer(many=True, read_only=True)

    class Meta:
        model = ExperienceDay
        fields = ['id', 'day_number', 'location_name', 'description', 'date', 'photos']


class ExperiencePostSerializer(serializers.ModelSerializer):
    days = ExperienceDaySerializer(many=True, read_only=True)
    author = UserSerializer(read_only=True)
    is_liked = serializers.SerializerMethodField()
    is_saved = serializers.SerializerMethodField()
    total_likes = serializers.SerializerMethodField()

    class Meta:
        model = ExperiencePost
        fields = [
            'id', 'author', 'title', 'cover_image',
            'days', 'created_at', 'is_liked', 'is_saved', 'total_likes'
        ]

    def get_is_liked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            from django.contrib.contenttypes.models import ContentType
            ct = ContentType.objects.get_for_model(obj)
            return Like.objects.filter(user=request.user, content_type=ct, object_id=obj.id).exists()
        return False

    def get_is_saved(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            from django.contrib.contenttypes.models import ContentType
            ct = ContentType.objects.get_for_model(obj)
            return SavedPost.objects.filter(user=request.user, content_type=ct, object_id=obj.id).exists()
        return False

    def get_total_likes(self, obj):
        from django.contrib.contenttypes.models import ContentType
        ct = ContentType.objects.get_for_model(obj)
        return Like.objects.filter(content_type=ct, object_id=obj.id).count()


class GeneralPostImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = GeneralPostImage
        fields = ['id', 'image']


class GeneralPostSerializer(serializers.ModelSerializer):
    images = GeneralPostImageSerializer(many=True, read_only=True)
    author = UserSerializer(read_only=True)
    is_liked = serializers.SerializerMethodField()
    is_saved = serializers.SerializerMethodField()
    total_likes = serializers.SerializerMethodField()

    class Meta:
        model = GeneralPost
        fields = [
            'id', 'author', 'description', 'images',
            'created_at', 'is_liked', 'is_saved', 'total_likes'
        ]

    def get_is_liked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            from django.contrib.contenttypes.models import ContentType
            ct = ContentType.objects.get_for_model(obj)
            return Like.objects.filter(user=request.user, content_type=ct, object_id=obj.id).exists()
        return False

    def get_is_saved(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            from django.contrib.contenttypes.models import ContentType
            ct = ContentType.objects.get_for_model(obj)
            return SavedPost.objects.filter(user=request.user, content_type=ct, object_id=obj.id).exists()
        return False

    def get_total_likes(self, obj):
        from django.contrib.contenttypes.models import ContentType
        ct = ContentType.objects.get_for_model(obj)
        return Like.objects.filter(content_type=ct, object_id=obj.id).count()


class CommentSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = Comment
        fields = ['id', 'user', 'text', 'created_at']


class MessageSerializer(serializers.ModelSerializer):
    is_mine = serializers.SerializerMethodField()

    class Meta:
        model = Message
        fields = ['id', 'sender', 'receiver', 'content', 'created_at', 'is_read', 'is_mine']

    def get_is_mine(self, obj):
        request = self.context.get('request')
        if request:
            return obj.sender == request.user
        return False


class NotificationSerializer(serializers.ModelSerializer):
    sender = UserSerializer(read_only=True)
    text = serializers.SerializerMethodField()

    class Meta:
        model = Notification
        fields = ['id', 'sender', 'notification_type', 'is_read', 'created_at', 'text']

    def get_text(self, obj):
        if obj.notification_type == 'join_request':
            return f"{obj.sender.username} requested to join your trip"
        elif obj.notification_type == 'request_accepted':
            return f"{obj.sender.username} accepted your join request"
        elif obj.notification_type == 'follow':
            return f"{obj.sender.username} started following you"
        elif obj.notification_type == 'like':
            return f"{obj.sender.username} liked your post"
        elif obj.notification_type == 'comment':
            return f"{obj.sender.username} commented on your post"
        return "You have a new notification"