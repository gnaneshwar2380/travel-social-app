from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from .views import (
    FollowViewSet, 
    TripJoinRequestViewSet,
    NotificationViewSet, 
    MessageViewSet,
    ProfileView, 
    ProfileUpdateView,
    ToggleLikeView, 
    ToggleSaveView,
    SavedPostListView, 
    CommentListCreateView,
    PostListCreateView, 
    PostRetrieveUpdateDestroyView,
    TripDayCreateView, 
    DayPhotoCreateView,
    ForYouFeedView, 
    FollowingFeedView, 
    SearchView, 
    RegisterView,
)

# -----------------------------
# Router setup for ViewSets
# -----------------------------
router = DefaultRouter()
router.register(r'follows', FollowViewSet, basename='follow')
router.register(r'notifications', NotificationViewSet, basename='notification')
router.register(r'messages', MessageViewSet, basename='message')
router.register(r'join-requests', TripJoinRequestViewSet, basename='joinrequest')

# -----------------------------
# URL patterns
# -----------------------------
urlpatterns = [
    path('', include(router.urls)),

    # 🔹 Authentication & Profile
    path('user/register/', RegisterView.as_view(), name='user-register'),
    path('profile/', ProfileView.as_view(), name='profile'),
    path('profile/update/', ProfileUpdateView.as_view(), name='profile-update'),

    # 🔹 Feed
    path('posts/foryou/', ForYouFeedView.as_view(), name='for_you_feed'),
    path('posts/following/', FollowingFeedView.as_view(), name='following_feed'),

    # 🔹 Posts
    path('posts/', PostListCreateView.as_view(), name='post-list-create'),
    path('posts/<int:pk>/', PostRetrieveUpdateDestroyView.as_view(), name='post-detail'),

    # 🔹 Likes / Saves / Comments
    path('posts/<int:pk>/like/', ToggleLikeView.as_view(), name='toggle-like'),
    path('posts/<int:pk>/save/', ToggleSaveView.as_view(), name='toggle-save'),
    path('posts/<int:pk>/comment/', CommentListCreateView.as_view(), name='post-comments'),

    # 🔹 Saved Posts
    path('saved/', SavedPostListView.as_view(), name='saved-posts'),

    # 🔹 Trips & Photos
    path('posts/<int:post_pk>/days/', TripDayCreateView.as_view(), name='trip-day-create'),
    path('posts/<int:post_pk>/days/<int:day_pk>/photos/', DayPhotoCreateView.as_view(), name='day-photo-create'),

    # 🔹 Search
    path('search/', SearchView.as_view(), name='search'),
]
