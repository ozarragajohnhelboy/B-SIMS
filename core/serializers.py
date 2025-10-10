from rest_framework import serializers
from .models import ActivityLog, Configuration


class ConfigurationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Configuration
        fields = ['id', 'key', 'value', 'description', 'created_at', 'updated_at']


class ConfigurationCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Configuration
        fields = ['key', 'value', 'description']


class ActivityLogSerializer(serializers.ModelSerializer):
    user_name = serializers.SerializerMethodField()
    user_role = serializers.SerializerMethodField()
    time_ago = serializers.ReadOnlyField()
    content_type_name = serializers.SerializerMethodField()

    class Meta:
        model = ActivityLog
        fields = ['id', 'user', 'user_name', 'user_role', 'action', 'description', 'content_type_name', 
                'object_id', 'ip_address', 'metadata', 'timestamp', 'time_ago']

    def get_user_name(self, obj):
        return f"{obj.user.first_name} {obj.user.last_name}".strip() or obj.user.username

    def get_user_role(self, obj):
        return obj.user.role if hasattr(obj.user, 'role') else 'User'

    def get_content_type_name(self, obj):
        return obj.content_type.model if obj.content_type else None