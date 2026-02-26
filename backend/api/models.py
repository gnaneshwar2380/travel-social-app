from django.db import models
from django.contrib.auth.models import AbstractUser
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType


class User(AbstractUser):
    email = models.EmailField(unique=True)
    full_name = models.CharField(max_length=50, blank=True)
    profile_pic = models.ImageField(upload_to='profile_pics/', blank=True, null=True)
    cover_pic = models.ImageField(upload_to='background_pics/', blank=True, null=True)
    bio = models.TextField(max_length=200, blank=True)

    def __str__(self):
        return self.username


class Follow(models.Model):
    follower = models.ForeignKey(User, on_delete=models.CASCADE, related_name='following')
    following = models.ForeignKey(User, on_delete=models.CASCADE, related_name='followers')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('follower', 'following')

    def __str__(self):
        return f"{self.follower} follows {self.following}"


class JoinableTripPost(models.Model):
    STATUS_CHOICES = [
        ('planning', 'Planning'),
        ('full', 'Full'),
        ('ongoing', 'Ongoing'),
        ('completed', 'Completed'),
    ]
    creator = models.ForeignKey(User, on_delete=models.CASCADE, related_name='joinable_trips')
    title = models.CharField(max_length=100)
    destination = models.TextField()
    budget = models.PositiveIntegerField()
    start_date = models.DateTimeField()
    end_date = models.DateTimeField()
    details = models.TextField()
    min_members = models.PositiveIntegerField(default=1)
    max_members = models.PositiveIntegerField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='planning')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} - {self.destination}"


class JoinableTripImage(models.Model):
    trip = models.ForeignKey(JoinableTripPost, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='trip_images/')

    def __str__(self):
        return f"Image for Trip {self.trip.id}"


class TripJoinRequest(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('rejected', 'Rejected'),
    ]
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='trip_requests')
    trip = models.ForeignKey(JoinableTripPost, on_delete=models.CASCADE, related_name='join_requests')
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'trip')

    def __str__(self):
        return f"{self.user} → {self.trip} ({self.status})"


class TripGroup(models.Model):
    trip = models.OneToOneField(JoinableTripPost, on_delete=models.CASCADE, related_name='group')
    name = models.CharField(max_length=100)
    members = models.ManyToManyField(User, related_name='trip_groups')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class TripGroupMember(models.Model):
    ROLE_CHOICES = [('admin', 'Admin'), ('member', 'Member')]
    group = models.ForeignKey(TripGroup, on_delete=models.CASCADE, related_name='group_memberships')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='trip_group_memberships')
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='member')  
    joined_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user} in {self.group}"


class ExperiencePost(models.Model):
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='experience_posts')
    title = models.CharField(max_length=150)
    cover_image = models.ImageField(upload_to='experience/covers/')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):  
        return self.title


class ExperienceDay(models.Model):
    post = models.ForeignKey(ExperiencePost, on_delete=models.CASCADE, related_name='days')
    day_number = models.PositiveIntegerField()
    location_name = models.CharField(max_length=100, blank=True)  
    description = models.TextField()
    date = models.DateField(null=True, blank=True)  

    class Meta:
        unique_together = ('post', 'day_number')
        ordering = ['day_number']

    def __str__(self):  
        return f"{self.post.title} - Day {self.day_number}"


class ExperienceDayImage(models.Model):
    day = models.ForeignKey(ExperienceDay, on_delete=models.CASCADE, related_name='photos')  
    image = models.ImageField(upload_to='experience/days/')
    caption = models.CharField(max_length=200, blank=True) 

    def __str__(self):  
        return f"Image for {self.day}"


class GeneralPost(models.Model):
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='general_posts')
    description = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self): 
        return f"Post by {self.author}"


class GeneralPostImage(models.Model):
    post = models.ForeignKey(GeneralPost, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='general_posts/')

    def __str__(self):
        return f"Image for post {self.post.id}"


class Like(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.PositiveIntegerField()
    content_object = GenericForeignKey('content_type', 'object_id')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'content_type', 'object_id')  
        indexes = [models.Index(fields=["content_type", "object_id"])]

    def __str__(self):
        return f"{self.user} liked {self.content_object}"


class Comment(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.PositiveIntegerField()
    content_object = GenericForeignKey('content_type', 'object_id')
    text = models.TextField(max_length=500)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Comment by {self.user}"


class SavedPost(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='saved_posts')
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.PositiveIntegerField()
    content_object = GenericForeignKey('content_type', 'object_id')
    saved_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'content_type', 'object_id')

    def __str__(self):
        return f"{self.user} saved {self.content_object}"


class Message(models.Model):
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_messages')
    receiver = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_messages', null=True, blank=True)
    group = models.ForeignKey(TripGroup, on_delete=models.CASCADE, related_name='messages', null=True, blank=True)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.sender.username}: {self.content[:30]}"


class Notification(models.Model):
    NOTIFICATION_TYPES = [
        ('join_request', 'Join Request'),
        ('request_accepted', 'Request Accepted'),
        ('follow', 'Follow'),
        ('like', 'Like'),
        ('comment', 'Comment'),
    ]
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_notifications')
    receiver = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    notification_type = models.CharField(max_length=30, choices=NOTIFICATION_TYPES)
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE, null=True, blank=True)
    object_id = models.PositiveIntegerField(null=True, blank=True)
    content_object = GenericForeignKey('content_type', 'object_id')
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.sender} → {self.receiver} ({self.notification_type})"