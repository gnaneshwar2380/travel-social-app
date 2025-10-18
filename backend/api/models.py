# backend/api/models.py
from django.db import models
from django.contrib.auth.models import User

# --- Your Profile model remains the same ---
class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    profile_picture = models.ImageField(upload_to='profile_pics/', default='profile_pics/default.jpg')
    background_picture = models.ImageField(upload_to='background_pics/', default='background_pics/default_bg.jpg')

    def __str__(self):
        return self.user.username

# --- Model 1: The "Instagram Highlight" cover ---
class Post(models.Model):
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name="posts")
    title = models.CharField(max_length=200)
    cover_photo = models.ImageField(upload_to='trip_covers/', null=True, blank=True)
    location_summary = models.CharField(max_length=100, blank=True, help_text="e.g., Goa, India")
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    is_joinable = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    

    def total_likes(self):
        return self.likes.count()
    
    def total_comments(self):
        return self.comments.count()

    def __str__(self):
        return self.title

# --- Model 2: Each "day" in the trip thread --
# -
class Like(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    post = models.ForeignKey(Post, related_name="likes", on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'post')

class Comment(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    post = models.ForeignKey(Post, related_name="comments", on_delete=models.CASCADE)
    text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

class SavedPost(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='saved_posts')
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='saves')
    saved_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'post')

    def __str__(self):
        return f"{self.user.username} saved {self.post.title}"

class TripDay(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='days')
    day_number = models.IntegerField()
    date = models.DateField(null=True, blank=True)
    location_name = models.CharField(max_length=100)
    description = models.TextField()
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)

    class Meta:
        ordering = ['day_number'] # Ensures days are always in order

    def __str__(self):
        return f"{self.post.title} - Day {self.day_number}"

# --- Model 3: The image slider for each day ---
class DayPhoto(models.Model):
    trip_day = models.ForeignKey(TripDay, on_delete=models.CASCADE, related_name='photos')
    image = models.ImageField(upload_to='day_photos/')
    caption = models.CharField(max_length=255, blank=True)

    def __str__(self):
        return f"Photo for {self.trip_day}"
    
class Follow(models.Model):
    follower = models.ForeignKey(User, related_name='following', on_delete=models.CASCADE)
    following = models.ForeignKey(User, related_name='followers', on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('follower', 'following')

    def __str__(self):
        return f"{self.follower} → {self.following}"
class TripJoinRequest(models.Model):
    post = models.ForeignKey(Post, related_name='join_requests', on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    is_approved = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('post', 'user')

    def __str__(self):
        return f"{self.user.username} requested to join {self.post.title}"

class Notification(models.Model):
    user = models.ForeignKey(User, related_name='notifications', on_delete=models.CASCADE)
    sender = models.ForeignKey(User, related_name='sent_notifications', on_delete=models.CASCADE, null=True, blank=True)
    post = models.ForeignKey(Post, null=True, blank=True, on_delete=models.CASCADE)
    text = models.CharField(max_length=255)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Notification for {self.user.username}: {self.text}"

class Message(models.Model):
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_messages')
    receiver = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_messages', null=True, blank=True)
    post = models.ForeignKey(Post, on_delete=models.CASCADE, null=True, blank=True)  # For trip group chats
    text = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.sender.username} → {self.receiver.username if self.receiver else self.post.title}"
