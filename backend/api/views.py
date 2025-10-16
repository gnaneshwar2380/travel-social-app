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

# --- User and Profile Views (no change) ---
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