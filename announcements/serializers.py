from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import AnnouncementCategory, Announcement, AnnouncementView, NotificationTemplate

User = get_user_model()


class AnnouncementCategorySerializer(serializers.ModelSerializer):
    announcements_count = serializers.SerializerMethodField()

    class Meta:
        model = AnnouncementCategory
        fields = ['id', 'name', 'description', 'color', 'icon', 'is_active', 'announcements_count', 'created_at', 'updated_at']

    def get_announcements_count(self, obj):
        return obj.announcements.filter(status='published').count()


class AnnouncementViewSerializer(serializers.ModelSerializer):
    class Meta:
        model = AnnouncementView
        fields = ['id', 'user', 'ip_address', 'viewed_at']


class AnnouncementListSerializer(serializers.ModelSerializer):
    category = AnnouncementCategorySerializer(read_only=True)
    created_by = serializers.StringRelatedField(read_only=True)
    views_count = serializers.ReadOnlyField()

    class Meta:
        model = Announcement
        fields = ['id', 'title', 'content', 'category', 'priority', 'status', 'publish_date', 'expiry_date', 
                'is_featured', 'is_pinned', 'attachment', 'image', 'created_by', 'views_count', 'created_at', 'updated_at']


class AnnouncementDetailSerializer(serializers.ModelSerializer):
    category = AnnouncementCategorySerializer(read_only=True)
    created_by = serializers.StringRelatedField(read_only=True)
    updated_by = serializers.StringRelatedField(read_only=True)
    views_count = serializers.ReadOnlyField()

    class Meta:
        model = Announcement
        fields = ['id', 'title', 'content', 'category', 'priority', 'status', 'publish_date', 'expiry_date', 
                'is_featured', 'is_pinned', 'attachment', 'image', 'created_by', 'updated_by', 'views_count', 'created_at', 'updated_at']


class AnnouncementCreateSerializer(serializers.ModelSerializer):
    category = serializers.PrimaryKeyRelatedField(queryset=AnnouncementCategory.objects.filter(is_active=True))
    
    class Meta:
        model = Announcement
        fields = ['title', 'content', 'category', 'priority', 'status', 'publish_date', 'expiry_date', 
                'is_featured', 'is_pinned', 'attachment', 'image']

    def validate_category(self, value):
        if not value.is_active:
            raise serializers.ValidationError("Selected category is not active.")
        return value

    def to_internal_value(self, data):
        mutable = dict(data)
        category_value = mutable.get('category')
        if isinstance(category_value, dict):
            category_id = category_value.get('id')
            mutable['category'] = category_id
        status_value = mutable.get('status')
        if isinstance(status_value, str):
            mutable['status'] = status_value.lower()
        priority_value = mutable.get('priority')
        if isinstance(priority_value, str):
            mutable['priority'] = priority_value.lower()
        return super().to_internal_value(mutable)


class NotificationTemplateSerializer(serializers.ModelSerializer):
    category = AnnouncementCategorySerializer(read_only=True)

    class Meta:
        model = NotificationTemplate
        fields = ['id', 'name', 'subject', 'message', 'category', 'is_active', 'created_at', 'updated_at']


class NotificationTemplateCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = NotificationTemplate
        fields = ['name', 'subject', 'message', 'category', 'is_active']
