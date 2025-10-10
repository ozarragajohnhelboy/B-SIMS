from rest_framework import generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Q
from django.utils import timezone
from datetime import datetime, timedelta
from ..models import ActivityLog
from ..serializers import ActivityLogSerializer


class ActivityLogListView(generics.ListAPIView):
    queryset = ActivityLog.objects.select_related('user', 'content_type').all()
    serializer_class = ActivityLogSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = ActivityLog.objects.select_related('user', 'content_type').all()
        
        action_filter = self.request.query_params.get('action', None)
        user_filter = self.request.query_params.get('user', None)
        search = self.request.query_params.get('search', None)
        date_from = self.request.query_params.get('date_from', None)
        date_to = self.request.query_params.get('date_to', None)
        limit = self.request.query_params.get('limit', 20)
        
        if action_filter:
            queryset = queryset.filter(action=action_filter)
        if user_filter:
            queryset = queryset.filter(user_id=user_filter)
        if search:
            queryset = queryset.filter(
                Q(description__icontains=search) |
                Q(user__first_name__icontains=search) |
                Q(user__last_name__icontains=search)
            )
        if date_from:
            try:
                date_from_obj = datetime.strptime(date_from, '%Y-%m-%d').date()
                queryset = queryset.filter(timestamp__date__gte=date_from_obj)
            except ValueError:
                pass
        if date_to:
            try:
                date_to_obj = datetime.strptime(date_to, '%Y-%m-%d').date()
                queryset = queryset.filter(timestamp__date__lte=date_to_obj)
            except ValueError:
                pass
        
        return queryset.order_by('-timestamp')[:int(limit)]


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def recent_activities(request):
    limit = request.query_params.get('limit', 10)
    date_from = request.query_params.get('date_from', None)
    date_to = request.query_params.get('date_to', None)
    
    queryset = ActivityLog.objects.select_related('user', 'content_type').all()
    
    if date_from:
        try:
            date_from_obj = datetime.strptime(date_from, '%Y-%m-%d').date()
            queryset = queryset.filter(timestamp__date__gte=date_from_obj)
        except ValueError:
            pass
    
    if date_to:
        try:
            date_to_obj = datetime.strptime(date_to, '%Y-%m-%d').date()
            queryset = queryset.filter(timestamp__date__lte=date_to_obj)
        except ValueError:
            pass
    
    activities = queryset.order_by('-timestamp')[:int(limit)]
    serializer = ActivityLogSerializer(activities, many=True)
    return Response(serializer.data)
