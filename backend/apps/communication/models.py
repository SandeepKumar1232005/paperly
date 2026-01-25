from django.db import models
from django.conf import settings

class Message(models.Model):
    sender = models.CharField(max_length=255) 
    recipient = models.CharField(max_length=255, null=True, blank=True)
    
    assignment = models.ForeignKey('assignments.Assignment', on_delete=models.CASCADE, related_name='messages', null=True, blank=True)
    content = models.TextField(blank=True, default='')
    file = models.FileField(upload_to='chat_uploads/', null=True, blank=True)
    
    is_read = models.BooleanField(default=False)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Msg from {self.sender} at {self.timestamp}"

class Announcement(models.Model):
    AUDIENCE_CHOICES = (
        ('ALL', 'All Users'),
        ('WRITER', 'Writers Only'),
        ('STUDENT', 'Students Only'),
    )
    title = models.CharField(max_length=255)
    content = models.TextField()
    target_audience = models.CharField(max_length=20, choices=AUDIENCE_CHOICES, default='ALL')
    
    created_by = models.CharField(max_length=255, null=True) # Fixed ForeignKey
    
    created_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.title
