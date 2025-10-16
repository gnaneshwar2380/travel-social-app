# backend/api/serializers.py
from rest_framework import serializers
from .models import Profile, Post, TripDay, DayPhoto
from django.contrib.auth.models import User

# --- Profile Serializers (no change) ---
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
class PostSerializer(serializers.ModelSerializer):
    days = TripDaySerializer(many=True, read_only=True) # Nested days
    author = serializers.ReadOnlyField(source='author.username') # Show author's name

    class Meta:
        model = Post
        fields = [
            "id", "author", "title", "cover_photo", "location_summary",
            "start_date", "end_date", "is_joinable", "created_at", "days"
        ]
        extra_kwargs = {"author": {"read_only": True}}