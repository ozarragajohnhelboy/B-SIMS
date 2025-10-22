from django.contrib import admin
from .models import AnnouncementCategory, Announcement, AnnouncementView, NotificationTemplate


@admin.register(AnnouncementCategory)
class AnnouncementCategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'color', 'is_active', 'created_at']
    list_filter = ['is_active', 'created_at']
    search_fields = ['name', 'description']
    ordering = ['name']


@admin.register(Announcement)
class AnnouncementAdmin(admin.ModelAdmin):
    list_display = ['title', 'category', 'status', 'priority', 'is_featured', 'is_pinned', 'publish_date', 'created_by']
    list_filter = ['status', 'priority', 'category', 'is_featured', 'is_pinned', 'created_at']
    search_fields = ['title', 'content']
    ordering = ['-created_at']
    readonly_fields = ['views_count', 'created_at', 'updated_at']

    def save_model(self, request, obj, form, change):
        if change:
            obj.updated_by = request.user
        else:
            obj.created_by = request.user
        super().save_model(request, obj, form, change)


@admin.register(AnnouncementView)
class AnnouncementViewAdmin(admin.ModelAdmin):
    list_display = ['announcement', 'user', 'ip_address', 'viewed_at']
    list_filter = ['viewed_at']
    search_fields = ['announcement__title', 'ip_address']
    ordering = ['-viewed_at']


@admin.register(NotificationTemplate)
class NotificationTemplateAdmin(admin.ModelAdmin):
    list_display = ['name', 'category', 'is_active', 'created_at']
    list_filter = ['is_active', 'category', 'created_at']
    search_fields = ['name', 'subject', 'message']
    ordering = ['name']