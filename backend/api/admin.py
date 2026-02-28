from django.contrib import admin
from .models import (
    JoinableTripPost, JoinableTripImage, TripJoinRequest,
    TripGroup, TripGroupMember, ExperiencePost, ExperienceDay,
    ExperienceDayImage, GeneralPost, GeneralPostImage,
    Like, Comment, SavedPost, Message, Notification, Follow
)

admin.site.register(JoinableTripPost)
admin.site.register(JoinableTripImage)
admin.site.register(TripJoinRequest)
admin.site.register(TripGroup)
admin.site.register(TripGroupMember)
admin.site.register(ExperiencePost)
admin.site.register(ExperienceDay)
admin.site.register(ExperienceDayImage)
admin.site.register(GeneralPost)
admin.site.register(GeneralPostImage)
admin.site.register(Like)
admin.site.register(Comment)
admin.site.register(SavedPost)
admin.site.register(Message)
admin.site.register(Notification)
admin.site.register(Follow)
