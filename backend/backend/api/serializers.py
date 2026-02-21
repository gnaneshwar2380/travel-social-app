from rest_framework import serializers
from .models import User,JoinableTripPost,JoinableTripImage,TripIntrest,TripGroup,ExperiencePost,ExperienceDay,ExperienceDayImage,GeneralPost,GeneralPostImage,Like,Comment,SavedPost

class ProfileSerializer(serializers.ModelSerializer):
    username = serializers