from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    FollowViewSet, PostViewSet, TripJoinRequestViewSet,
    NotificationViewSet, MessageViewSet,
    ProfileView, ProfileUpdateView, CreateUserView,
    ToggleLikeView, ToggleSaveView,
    SavedPostListView, CommentListCreateView,
    PostListCreateView, PostRetrieveUpdateDestroyView,
    TripDayCreateView, DayPhotoCreateView,
)
from . import views
from django.conf import settings
from django.conf.urls.static import static

router = DefaultRouter()
router.register(r'follows', FollowViewSet, basename='follow')
router.register(r'posts', PostViewSet, basename='post')
router.register(r'join-requests', TripJoinRequestViewSet, basename='joinrequest')
router.register(r'notifications', NotificationViewSet, basename='notification')
router.register(r'messages', MessageViewSet, basename='message')

urlpatterns = [
    path("register/", CreateUserView.as_view(), name="register"),
    path("profile/", ProfileView.as_view(), name="profile"),
    path("profile/update/", ProfileUpdateView.as_view(), name="profile-update"),

    path("posts/", PostListCreateView.as_view(), name="post-list-create"),
    path("posts/<int:pk>/", PostRetrieveUpdateDestroyView.as_view(), name="post-detail"),
    path("posts/<int:post_pk>/days/", TripDayCreateView.as_view(), name="trip-day-create"),
    path("posts/<int:post_pk>/days/<int:day_pk>/photos/", DayPhotoCreateView.as_view(), name="day-photo-create"),

    path("posts/<int:pk>/like/", ToggleLikeView.as_view(), name="toggle-like"),
    path('posts/<int:pk>/save/', ToggleSaveView.as_view(), name='toggle-save'),
    path("posts/<int:pk>/comments/", CommentListCreateView.as_view(), name="post-comments"),
    path("saved/", SavedPostListView.as_view(), name="saved-posts"),

    path('', include(router.urls)),
    path('posts/foryou/', views.foryou_feed),
    path('posts/following/', views.following_feed),
    path('search/', views.search),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
