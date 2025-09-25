# backend/api/serializers.py
from django.contrib.auth.models import User
from rest_framework import serializers


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email", "password"]
        # This ensures the password is not sent back in API responses
        extra_kwargs = {"password": {"write_only": True}}

    def create(self, validated_data):
        # This uses Django's helper to create a user with a hashed password
        user = User.objects.create_user(**validated_data)
        return user