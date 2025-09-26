# backend/api/serializers.py
from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Post, Profile # <-- 1. Import the Profile model

# 2. Create a new serializer for the Profile model
class ProfileSerializer(serializers.ModelSerializer):
    # We create custom fields to build the full URL
    profile_picture = serializers.SerializerMethodField()
    background_picture = serializers.SerializerMethodField()

    class Meta:
        model = Profile
        fields = ["profile_picture", "background_picture"]

    # This method builds the full URL for the profile_picture
    def get_profile_picture(self, obj):
        request = self.context.get('request')
        if obj.profile_picture and hasattr(obj.profile_picture, 'url'):
            return request.build_absolute_uri(obj.profile_picture.url)
        return None # Or a default URL

    # This method builds the full URL for the background_picture
    def get_background_picture(self, obj):
        request = self.context.get('request')
        if obj.background_picture and hasattr(obj.background_picture, 'url'):
            return request.build_absolute_uri(obj.background_picture.url)
        return None

class UserSerializer(serializers.ModelSerializer):
    trips_count = serializers.SerializerMethodField()
    # 3. Nest the ProfileSerializer here
    profile = ProfileSerializer(read_only=True)

    class Meta:
        model = User
        # 4. Add "profile" to the list of fields
        fields = ["id", "username", "email", "password", "trips_count", "profile"]
        extra_kwargs = {"password": {"write_only": True}}

    def get_trips_count(self, obj):
        # We now get the count from the related 'posts' field
        return obj.posts.count()

    def create(self, validated_data):
        # We don't need to pop trips_count anymore
        user = User.objects.create_user(**validated_data)
        return user

class PostSerializer(serializers.ModelSerializer):
    class Meta:
        model = Post
        fields = ["id", "title", "content", "created_at", "author"]
        extra_kwargs = {"author": {"read_only": True}}