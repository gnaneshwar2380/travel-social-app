from django.urls import path
from . import views

urlpatterns = [
    path('user/register/', views.RegisterView.as_view()),
    path('profile/', views.ProfileView.as_view()),
    path('profile/update/', views.ProfileView.as_view()),
    path('profile/<str:username>/', views.UserProfileView.as_view()),

    path('follows/<int:user_id>/toggle/', views.FollowToggleView.as_view()),
    path('follows/<int:user_id>/is_following/', views.IsFollowingView.as_view()),
    path('follows/mates/', views.MatesListView.as_view()),

    path('posts/', views.ExperiencePostListCreateView.as_view()),
    path('posts/<int:pk>/', views.ExperiencePostDetailView.as_view()),
    path('posts/<int:post_id>/days/', views.ExperienceDayListCreateView.as_view()),
    path('days/<int:day_id>/images/', views.ExperienceDayImageUploadView.as_view()),

    path('posts/foryou/', views.ForYouFeedView.as_view()),
    path('posts/following/', views.FollowingFeedView.as_view()),
    path('posts/<str:username>/user/', views.UserPostsView.as_view()),

    path('posts/<str:model_name>/<int:pk>/like/', views.LikeToggleView.as_view()),
    path('posts/<str:model_name>/<int:pk>/save/', views.SaveToggleView.as_view()),
    path('posts/<str:model_name>/<int:pk>/comments/', views.CommentListCreateView.as_view()),

    path('joinable-trips/', views.JoinableTripListCreateView.as_view()),
    path('joinable-trips/<int:pk>/', views.JoinableTripDetailView.as_view()),
    path('joinable-trips/<int:trip_id>/join/', views.TripJoinRequestView.as_view()),
    path('joinable-trips/requests/<int:request_id>/approve/', views.TripJoinRequestApproveView.as_view()),

    path('search/', views.SearchView.as_view()),
    path('saved/', views.SavedPostsListView.as_view()),

    path('messages/conversations/', views.ConversationListView.as_view()),
    path('messages/chat/<int:user_id>/', views.ChatView.as_view()),

    path('notifications/', views.NotificationListView.as_view()),
    path('notifications/mark_all_read/', views.MarkAllNotificationsReadView.as_view()),
]