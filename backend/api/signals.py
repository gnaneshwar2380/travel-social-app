# backend/api/signals.py
from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Like, Comment, TripJoinRequest, Notification

@receiver(post_save, sender=Like)
def create_like_notification(sender, instance, created, **kwargs):
    if created:
        Notification.objects.create(
            user=instance.post.author,
            sender=instance.user,
            post=instance.post,
            text=f"{instance.user.username} liked your post '{instance.post.title}'."
        )

@receiver(post_save, sender=Comment)
def create_comment_notification(sender, instance, created, **kwargs):
    if created:
        Notification.objects.create(
            user=instance.post.author,
            sender=instance.user,
            post=instance.post,
            text=f"{instance.user.username} commented on your post '{instance.post.title}'."
        )

@receiver(post_save, sender=TripJoinRequest)
def create_join_request_notification(sender, instance, created, **kwargs):
    if created:
        Notification.objects.create(
            user=instance.post.author,
            sender=instance.user,
            post=instance.post,
            text=f"{instance.user.username} requested to join your trip '{instance.post.title}'."
        )
    elif instance.is_approved:
        Notification.objects.create(
            user=instance.user,
            sender=instance.post.author,
            post=instance.post,
            text=f"Your request to join '{instance.post.title}' was approved!"
        )
