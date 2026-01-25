from django.db import models
from django.conf import settings

class Assignment(models.Model):
    STATUS_CHOICES = (
        ('PENDING_REVIEW', 'Pending Review'),
        ('QUOTED', 'Quoted'),
        ('CONFIRMED', 'Confirmed'),
        ('IN_PROGRESS', 'In Progress'),
        ('COMPLETED', 'Completed'),
        ('CANCELLED', 'Cancelled'),
    )
    
    PAYMENT_STATUS_CHOICES = (
        ('PENDING', 'Pending'),
        ('PAID', 'Paid'),
        ('REFUNDED', 'Refunded'),
    )

    title = models.CharField(max_length=200)
    description = models.TextField()
    subject = models.CharField(max_length=100)
    budget = models.DecimalField(max_digits=10, decimal_places=2)
    deadline = models.DateTimeField()
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING_REVIEW')
    payment_status = models.CharField(max_length=20, choices=PAYMENT_STATUS_CHOICES, default='PENDING')
    revision_count = models.IntegerField(default=0)
    
    quoted_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    writer_comment = models.TextField(null=True, blank=True)
    
    student = models.CharField(max_length=255) # models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='created_assignments')
    provider = models.CharField(max_length=255, null=True, blank=True) # models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_jobs')
    
    files = models.JSONField(default=list, blank=True)
    attachment = models.FileField(upload_to='assignments/attachments/', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title
