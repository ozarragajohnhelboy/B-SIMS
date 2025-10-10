from django.contrib.contenttypes.models import ContentType
from django.utils import timezone
from core.models import ActivityLog


def log_activity(user, action, description, content_object=None, ip_address=None, user_agent=None, metadata=None):
    content_type = None
    object_id = None
    
    if content_object:
        content_type = ContentType.objects.get_for_model(content_object)
        object_id = content_object.pk
    
    ActivityLog.objects.create(
        user=user,
        action=action,
        content_type=content_type,
        object_id=object_id,
        description=description,
        ip_address=ip_address,
        user_agent=user_agent or '',
        metadata=metadata or {}
    )


def get_recent_activities(limit=10):
    return ActivityLog.objects.select_related('user', 'content_type').order_by('-timestamp')[:limit]
