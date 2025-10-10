from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Q, Count
from django.utils import timezone
from django.shortcuts import get_object_or_404
from ..models import Announcement, AnnouncementView
from ..serializers import AnnouncementListSerializer, AnnouncementDetailSerializer, AnnouncementCreateSerializer


class AnnouncementListView(generics.ListCreateAPIView):
    serializer_class = AnnouncementListSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = Announcement.objects.select_related('category', 'created_by').all()
        
        status_filter = self.request.query_params.get('status', None)
        category_filter = self.request.query_params.get('category', None)
        priority_filter = self.request.query_params.get('priority', None)
        search = self.request.query_params.get('search', None)
        
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        if category_filter:
            queryset = queryset.filter(category_id=category_filter)
        if priority_filter:
            queryset = queryset.filter(priority=priority_filter)
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) | 
                Q(content__icontains=search)
            )
        
        return queryset.order_by('-is_pinned', '-publish_date', '-created_at')

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class AnnouncementDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Announcement.objects.select_related('category', 'created_by', 'updated_by')
    serializer_class = AnnouncementDetailSerializer
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return AnnouncementCreateSerializer
        return AnnouncementDetailSerializer

    def perform_update(self, serializer):
        serializer.save(updated_by=self.request.user)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def track_announcement_view(request, pk):
    announcement = get_object_or_404(Announcement, pk=pk)
    
    ip_address = request.META.get('REMOTE_ADDR')
    user = request.user if request.user.is_authenticated else None
    
    view, created = AnnouncementView.objects.get_or_create(
        announcement=announcement,
        ip_address=ip_address,
        defaults={'user': user}
    )
    
    if created:
        announcement.views_count += 1
        announcement.save(update_fields=['views_count'])
    
    return Response({'status': 'success'})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def announcement_stats(request):
    total_announcements = Announcement.objects.count()
    published_announcements = Announcement.objects.filter(status='published').count()
    draft_announcements = Announcement.objects.filter(status='draft').count()
    featured_announcements = Announcement.objects.filter(is_featured=True, status='published').count()
    pinned_announcements = Announcement.objects.filter(is_pinned=True, status='published').count()
    
    recent_announcements = Announcement.objects.filter(
        status='published',
        publish_date__gte=timezone.now() - timezone.timedelta(days=7)
    ).count()
    
    return Response({
        'total_announcements': total_announcements,
        'published_announcements': published_announcements,
        'draft_announcements': draft_announcements,
        'featured_announcements': featured_announcements,
        'pinned_announcements': pinned_announcements,
        'recent_announcements': recent_announcements
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def publish_announcement(request, pk):
    announcement = get_object_or_404(Announcement, pk=pk)
    
    if announcement.status == 'draft':
        announcement.status = 'published'
        if not announcement.publish_date:
            announcement.publish_date = timezone.now()
        announcement.updated_by = request.user
        announcement.save()
        
        return Response({'status': 'published'})
    
    return Response({'error': 'Announcement is not in draft status'}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def archive_announcement(request, pk):
    announcement = get_object_or_404(Announcement, pk=pk)
    
    announcement.status = 'archived'
    announcement.updated_by = request.user
    announcement.save()
    
    return Response({'status': 'archived'})
