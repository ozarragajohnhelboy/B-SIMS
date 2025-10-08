from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    ROLE_CHOICES = [
        ('admin', 'Admin'),
        ('secretary', 'Secretary'),
        ('treasurer', 'Treasurer'),
        ('resident', 'Resident'),
    ]
    
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='resident')
    phone_number = models.CharField(max_length=15, blank=True)
    address = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"
    
    @property
    def is_admin(self):
        return self.role == 'admin'
    
    @property
    def is_secretary(self):
        return self.role == 'secretary'
    
    @property
    def is_treasurer(self):
        return self.role == 'treasurer'
    
    @property
    def is_resident(self):
        return self.role == 'resident'