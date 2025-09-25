# backend/api/models.py
from django.db import models
from django.contrib.auth.models import User

# The Post model for our travel feed later.
# No extra models are needed for a standard username/password login system.
class Post(models.Model):
    title = models.CharField(max_length=100)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name="posts")

    def __str__(self):
        return self.title