# backend/api/urls.py
from django.urls import path,include
from . import views
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import ProfileUpdateView
from django.conf import settings             
from django.conf.urls.static import static
from rest_framework.routers import DefaultRouter
from .views import (
    FollowViewSet, PostViewSet, TripJoinRequestViewSet,
    NotificationViewSet, MessageViewSet
)

router = DefaultRouter()
router.register(r'follows', FollowViewSet, basename='follow')
router.register(r'posts', PostViewSet, basename='post')
router.register(r'join-requests', TripJoinRequestViewSet, basename='joinrequest')
router.register(r'notifications', NotificationViewSet, basename='notification')
router.register(r'messages', MessageViewSet, basename='message')

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
    path("posts/<int:pk>/like/", views.ToggleLikeView.as_view(), name="toggle-like"),
      path('posts/<int:pk>/save/', views.ToggleSaveView.as_view(), name='toggle-save'),
    path("posts/<int:pk>/comments/", views.CommentListCreateView.as_view(), name="post-comments"),
    path("saved/", views.SavedPostListView.as_view(), name="saved-posts"),
     path('', include(router.urls)),
]
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)