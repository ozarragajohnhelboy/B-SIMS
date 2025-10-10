from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Q, Count
from django.utils import timezone
from ..models import AnnouncementCategory
from ..serializers import AnnouncementCategorySerializer


class AnnouncementCategoryListView(generics.ListCreateAPIView):
    queryset = AnnouncementCategory.objects.filter(is_active=True)
    serializer_class = AnnouncementCategorySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = AnnouncementCategory.objects.all()
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) | 
                Q(description__icontains=search)
            )
        return queryset.order_by('name')


class AnnouncementCategoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = AnnouncementCategory.objects.all()
    serializer_class = AnnouncementCategorySerializer
    permission_classes = [IsAuthenticated]


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def announcement_category_stats(request):
    categories = AnnouncementCategory.objects.annotate(
        total_announcements=Count('announcements'),
        published_announcements=Count('announcements', filter=Q(announcements__status='published')),
        draft_announcements=Count('announcements', filter=Q(announcements__status='draft'))
    ).order_by('name')
    
    serializer = AnnouncementCategorySerializer(categories, many=True)
    return Response(serializer.data)
