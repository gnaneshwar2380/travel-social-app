from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.contenttypes.models import ContentType
from .models import TripJoinRequest, Notification,TripGroup, TripGroupMember

@receiver(post_save,sender=TripJoinRequest)
def notify_trip_owner_on_request(sender,instance,created,**kwargs):
    if created:
        trip = instance.trip
        owner = trip.creator
        sender_user = instance.user

        Notification.objects.create(
            sender = sender_user,
            receiver = owner,
            notification_type='join_request',
            content_type = ContentType.objects.get_for_model(instance),
            object_id=instance.id
        )

@receiver(post_save,sender=TripJoinRequest)
def handle_request_acceptance(sende,instance,created,**Kwrgs):
    if not created and instance.status == 'accepted':
        trip = instance.trip
        user = instance.user
    group, _ = TripGroup.objects.get_or_create(
            trip=trip,
            defaults={'name': f"{trip.title} Group"}
        )
    
    TripGroupMember.objects.get_or_create(
            group=group,
            user=user,
            defaults={'role': 'member'}
        )
 
    Notification.objects.create(
            sender=trip.creator,
            receiver=user,
            notification_type='request_accepted',
            content_object=instance
        )

