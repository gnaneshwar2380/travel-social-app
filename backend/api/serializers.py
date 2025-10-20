# backend/api/serializers.py
from rest_framework import serializers
from .models import Profile,Comment, SavedPost, Post, TripDay, DayPhoto,Follow, TripJoinRequest,Notification, Message
from django.contrib.auth.models import User

# --- Profile Serializers (no change) ---

class CommentSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = Comment
        fields = ['id', 'user', 'text', 'created_at']


class SavedPostSerializer(serializers.ModelSerializer):
    post_title = serializers.CharField(source='post.title', read_only=True)

    class Meta:
        model = SavedPost
        fields = ['id', 'post', 'post_title', 'saved_at']

class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = ["profile_picture", "background_picture"]

class ProfileUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = ["profile_picture"]
        extra_kwargs = {
            'profile_picture': {'required': False}
        }

# --- User Serializer (no change) ---
class UserSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer(read_only=True)
    class Meta:
        model = User
        fields = ["id", "username", "password", "profile"]
        extra_kwargs = {"password": {"write_only": True}}

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        Profile.objects.create(user=user)
        return user

# --- NEW Nested Trip Serializers ---

# Serializer 3: Translates a single photo
class DayPhotoSerializer(serializers.ModelSerializer):
    class Meta:
        model = DayPhoto
        fields = ["id", "image", "caption"]

# Serializer 2: Translates a single day AND nests its photos
class TripDaySerializer(serializers.ModelSerializer):
    photos = DayPhotoSerializer(many=True, read_only=True) # Nested photos

    class Meta:
        model = TripDay
        fields = ["id", "day_number", "date", "location_name", "description", "latitude", "longitude", "photos"]

# Serializer 1: Translates the main post AND nests its days
# backend/api/serializers.py
class PostSerializer(serializers.ModelSerializer):
    days = TripDaySerializer(many=True, read_only=True)
    author = serializers.ReadOnlyField(source='author.username')
    total_likes = serializers.IntegerField(source='likes.count', read_only=True)
    total_comments = serializers.IntegerField(source='comments.count', read_only=True)
    is_liked = serializers.SerializerMethodField()
    is_saved = serializers.SerializerMethodField()
    comments = CommentSerializer(many=True, read_only=True)
    author_profile = serializers.SerializerMethodField() 

    class Meta:
        model = Post
        fields = [
            "id", "author", "caption", "cover_photo", "location_summary",  
            "start_date", "end_date", "is_joinable", "created_at", "days",
            "total_likes", "total_comments", "is_liked", "is_saved",
            "author_profile", "comments"  
        ]

    def get_is_liked(self, obj):
        user = self.context['request'].user
        if user.is_authenticated:
            return obj.likes.filter(user=user).exists()
        return False

    def get_is_saved(self, obj):
        user = self.context['request'].user
        if user.is_authenticated:
            return SavedPost.objects.filter(post=obj, user=user).exists()
        return False

    def get_author_profile(self, obj):
        request = self.context.get('request')
        if hasattr(obj.author, "profile_picture") and obj.author.profile_picture:
            return request.build_absolute_uri(obj.author.profile_picture.url)
        return None

class TripJoinRequestSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    post = PostSerializer(read_only=True)

    class Meta:
        model = TripJoinRequest
        fields = ['id', 'user', 'post', 'is_approved', 'created_at']

class NotificationSerializer(serializers.ModelSerializer):
    sender = UserSerializer(read_only=True)
    post = PostSerializer(read_only=True)

    class Meta:
        model = Notification
        fields = ['id', 'user', 'sender', 'post', 'text', 'is_read', 'created_at']

class MessageSerializer(serializers.ModelSerializer):
    sender = UserSerializer(read_only=True)
    receiver = UserSerializer(read_only=True)

    class Meta:
        model = Message
        fields = ['id', 'sender', 'receiver', 'post', 'text', 'timestamp']

class FollowSerializer(serializers.ModelSerializer):
    follower = UserSerializer(read_only=True)
    following = UserSerializer(read_only=True)

    class Meta:
        model = Follow
        fields = ['id', 'follower', 'following', 'created_at']