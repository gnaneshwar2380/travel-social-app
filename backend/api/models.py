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

    def __str__(self):
        return self.title

# --- Model 2: Each "day" in the trip thread ---
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
