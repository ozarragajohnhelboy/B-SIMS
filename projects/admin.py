from django.contrib import admin
from .models import ProjectType, Project, ProjectPhoto, ProjectReceipt, ProjectMilestone, CommunityEvent


@admin.register(ProjectType)
class ProjectTypeAdmin(admin.ModelAdmin):
    list_display = ['name', 'description', 'color', 'is_active', 'created_at']
    list_filter = ['is_active', 'created_at']
    search_fields = ['name', 'description']


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ['project_number', 'title', 'project_type', 'status', 'progress_percentage', 'budget_allocated', 'start_date', 'end_date']
    list_filter = ['status', 'priority', 'project_type', 'is_public', 'created_at']
    search_fields = ['title', 'description', 'location', 'project_number']
    date_hierarchy = 'start_date'


@admin.register(ProjectPhoto)
class ProjectPhotoAdmin(admin.ModelAdmin):
    list_display = ['project', 'caption', 'uploaded_by', 'uploaded_at']
    list_filter = ['uploaded_at']
    search_fields = ['project__title', 'caption']


@admin.register(ProjectReceipt)
class ProjectReceiptAdmin(admin.ModelAdmin):
    list_display = ['project', 'amount', 'vendor', 'receipt_date', 'uploaded_by']
    list_filter = ['receipt_date', 'uploaded_at']
    search_fields = ['project__title', 'description', 'vendor']


@admin.register(ProjectMilestone)
class ProjectMilestoneAdmin(admin.ModelAdmin):
    list_display = ['project', 'title', 'target_date', 'is_completed', 'completed_date']
    list_filter = ['is_completed', 'target_date']
    search_fields = ['project__title', 'title']


@admin.register(CommunityEvent)
class CommunityEventAdmin(admin.ModelAdmin):
    list_display = ['event_number', 'title', 'event_type', 'start_datetime', 'location', 'organizer']
    list_filter = ['event_type', 'is_public', 'created_at']
    search_fields = ['title', 'description', 'location']
    date_hierarchy = 'start_datetime'
