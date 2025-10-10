from rest_framework import generics, permissions, filters
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.db.models import Count
from django.utils import timezone
from datetime import datetime, timedelta
from ..models import CommunityEvent
from ..serializers import CommunityEventSerializer, CommunityEventCreateSerializer


class CommunityEventListView(generics.ListCreateAPIView):
    queryset = CommunityEvent.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['event_type', 'is_public']
    search_fields = ['title', 'description', 'location']
    ordering_fields = ['start_datetime', 'created_at']
    ordering = ['start_datetime']
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return CommunityEventCreateSerializer
        return CommunityEventSerializer
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user, organizer=self.request.user)


class CommunityEventDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = CommunityEvent.objects.all()
    serializer_class = CommunityEventSerializer
    permission_classes = [permissions.IsAuthenticated]


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def upcoming_events_view(request):
    now = timezone.now()
    events = CommunityEvent.objects.filter(
        start_datetime__gte=now,
        is_public=True
    ).order_by('start_datetime')[:10]
    
    serializer = CommunityEventSerializer(events, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def calendar_events_view(request):
    start_date = request.GET.get('start')
    end_date = request.GET.get('end')
    
    if not start_date or not end_date:
        return Response({'error': 'Start and end dates are required'}, status=400)
    
    try:
        start = datetime.fromisoformat(start_date.replace('Z', '+00:00'))
        end = datetime.fromisoformat(end_date.replace('Z', '+00:00'))
    except ValueError:
        return Response({'error': 'Invalid date format'}, status=400)
    
    events = CommunityEvent.objects.filter(
        start_datetime__gte=start,
        end_datetime__lte=end,
        is_public=True
    )
    
    calendar_events = []
    for event in events:
        calendar_events.append({
            'id': event.id,
            'title': event.title,
            'start': event.start_datetime.isoformat(),
            'end': event.end_datetime.isoformat(),
            'description': event.description,
            'location': event.location,
            'type': event.event_type,
            'color': '#3B82F6'
        })
    
    return Response(calendar_events)
