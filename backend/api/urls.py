# backend/api/urls.py
from django.urls import path
from . import views
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import ProfileUpdateView

urlpatterns = [
    # --- Auth ---
    path("token/", TokenObtainPairView.as_view(), name="get_token"),
    path("token/refresh/", TokenRefreshView.as_view(), name="refresh"),

    # --- User and Profile ---
    path("register/", views.CreateUserView.as_view(), name="register"),
    path("profile/", views.ProfileView.as_view(), name="profile"),
    path("profile/update/", views.ProfileUpdateView.as_view(), name="profile-update"),

    # --- NEW Trip Post URLs ---
    # List and create posts
    path("posts/", views.PostListCreateView.as_view(), name="post-list-create"),
    # Retrieve, update, or delete a single post by its ID (pk)
    path("posts/<int:pk>/", views.PostRetrieveUpdateDestroyView.as_view(), name="post-detail"),
    # Add a day to a specific post
    path("posts/<int:post_pk>/days/", views.TripDayCreateView.as_view(), name="trip-day-create"),
    # Add a photo to a specific day
    path("posts/<int:post_pk>/days/<int:day_pk>/photos/", views.DayPhotoCreateView.as_view(), name="day-photo-create"),
]