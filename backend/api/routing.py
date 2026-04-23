from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    re_path(r'ws/notifications/$', consumers.NotificationConsumer.as_asgi()),
]
