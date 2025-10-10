from django.db import models
from django.contrib.auth import get_user_model
from decimal import Decimal
import uuid

User = get_user_model()


class ProjectType(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    color = models.CharField(max_length=7, default='#3B82F6')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['name']
        verbose_name = "Project Type"
        verbose_name_plural = "Project Types"
    
    def __str__(self):
        return self.name


class Project(models.Model):
    STATUS_CHOICES = [
        ('planning', 'Planning'),
        ('ongoing', 'Ongoing'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
        ('on_hold', 'On Hold'),
    ]
    
    PRIORITY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('urgent', 'Urgent'),
    ]
    
    project_number = models.CharField(max_length=20, unique=True, blank=True)
    title = models.CharField(max_length=200)
    description = models.TextField()
    project_type = models.ForeignKey(ProjectType, on_delete=models.CASCADE, related_name='projects')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='planning')
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='medium')
    
    budget_allocated = models.DecimalField(max_digits=15, decimal_places=2)
    budget_spent = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal('0.00'))
    progress_percentage = models.IntegerField(default=0)
    
    start_date = models.DateField()
    end_date = models.DateField()
    actual_start_date = models.DateField(null=True, blank=True)
    actual_end_date = models.DateField(null=True, blank=True)
    
    location = models.TextField()
    project_manager = models.ForeignKey(User, on_delete=models.CASCADE, related_name='managed_projects')
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_projects')
    
    is_public = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.project_number} - {self.title}"
    
    def save(self, *args, **kwargs):
        if not self.project_number:
            self.project_number = f"PRJ{Project.objects.count() + 1:06d}"
        super().save(*args, **kwargs)
    
    @property
    def budget_remaining(self):
        return self.budget_allocated - self.budget_spent
    
    @property
    def is_overdue(self):
        from django.utils import timezone
        return self.end_date < timezone.now().date() and self.status != 'completed'
    
    @property
    def days_remaining(self):
        from django.utils import timezone
        if self.status == 'completed':
            return 0
        delta = self.end_date - timezone.now().date()
        return max(0, delta.days)


class ProjectPhoto(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='photos')
    photo = models.ImageField(upload_to='project_photos/')
    caption = models.TextField(blank=True)
    uploaded_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='uploaded_photos')
    uploaded_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-uploaded_at']
    
    def __str__(self):
        return f"Photo for {self.project.title}"


class ProjectReceipt(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='receipts')
    receipt = models.FileField(upload_to='project_receipts/')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.TextField()
    vendor = models.CharField(max_length=200, blank=True)
    receipt_date = models.DateField()
    uploaded_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='uploaded_receipts')
    uploaded_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-receipt_date']
    
    def __str__(self):
        return f"Receipt for {self.project.title} - ₱{self.amount}"


class ProjectMilestone(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='milestones')
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    target_date = models.DateField()
    completed_date = models.DateField(null=True, blank=True)
    is_completed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['target_date']
    
    def __str__(self):
        return f"{self.project.title} - {self.title}"


class CommunityEvent(models.Model):
    EVENT_TYPE_CHOICES = [
        ('meeting', 'Community Meeting'),
        ('festival', 'Festival/Celebration'),
        ('training', 'Training/Seminar'),
        ('health', 'Health Program'),
        ('sports', 'Sports Event'),
        ('other', 'Other'),
    ]
    
    event_number = models.CharField(max_length=20, unique=True, blank=True)
    title = models.CharField(max_length=200)
    description = models.TextField()
    event_type = models.CharField(max_length=20, choices=EVENT_TYPE_CHOICES)
    
    start_datetime = models.DateTimeField()
    end_datetime = models.DateTimeField()
    location = models.TextField()
    
    budget_allocated = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    budget_spent = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    
    organizer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='organized_events')
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_events')
    
    is_public = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['start_datetime']
    
    def __str__(self):
        return f"{self.event_number} - {self.title}"
    
    def save(self, *args, **kwargs):
        if not self.event_number:
            self.event_number = f"EVT{CommunityEvent.objects.count() + 1:06d}"
        super().save(*args, **kwargs)
    
    @property
    def is_upcoming(self):
        from django.utils import timezone
        return self.start_datetime > timezone.now()
    
    @property
    def is_ongoing(self):
        from django.utils import timezone
        now = timezone.now()
        return self.start_datetime <= now <= self.end_datetime
    
    @property
    def is_past(self):
        from django.utils import timezone
        return self.end_datetime < timezone.now()
