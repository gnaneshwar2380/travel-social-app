# backend/api/views.py

from django.db.models import Count
from django.contrib.auth.models import User
from rest_framework import generics
from .serializers import UserSerializer, PostSerializer,ProfileSerializer
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import Post,Profile
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

class CreateUserView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny] # <-- This line is important to allow new users to register

class PostListCreate(generics.ListCreateAPIView):
    serializer_class = PostSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Post.objects.filter(author=self.request.user)

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

class ProfileView(generics.RetrieveAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
    queryset = User.objects.all()

    # These two methods MUST be indented to be inside the ProfileView class
    def get_object(self):
        return self.request.user

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['trips_count'] = Post.objects.filter(author=self.request.user).count()
        return context

class ProfileUpdateView(generics.UpdateAPIView):
    serializer_class = ProfileSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]
    queryset = Profile.objects.all()

    def get_object(self):
        profile, created = Profile.objects.get_or_create(user=self.request.user)
        return profile