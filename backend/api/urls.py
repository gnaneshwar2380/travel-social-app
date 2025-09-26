# backend/api/urls.py
from django.urls import path
from .views import CreateUserView, ProfileView ,ProfileUpdateView,PostListCreate # <-- Make sure this line is correct
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path('user/register/', CreateUserView.as_view(), name='register'),
    path('token/', TokenObtainPairView.as_view(), name='get_token'),
    path('token/refresh/', TokenRefreshView.as_view(), name='refresh'),
    path('profile/', ProfileView.as_view(), name='profile'),
    path('posts/', PostListCreate.as_view(), name='posts'),
    path('profile/update/', ProfileUpdateView.as_view(), name='profile-update'),
]