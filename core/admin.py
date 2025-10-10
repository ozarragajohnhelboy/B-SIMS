from django.contrib import admin
from .models import Configuration, ActivityLog


@admin.register(Configuration)
class ConfigurationAdmin(admin.ModelAdmin):
    list_display = ('key', 'value', 'description', 'created_at')
    search_fields = ('key', 'value', 'description')
    readonly_fields = ('created_at', 'updated_at')


@admin.register(ActivityLog)
class ActivityLogAdmin(admin.ModelAdmin):
    list_display = ('user', 'action', 'description', 'timestamp', 'ip_address')
    list_filter = ('action', 'timestamp', 'content_type')
    search_fields = ('user__first_name', 'user__last_name', 'description')
    readonly_fields = ('timestamp', 'content_type', 'object_id')
    ordering = ('-timestamp',)