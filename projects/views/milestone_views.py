from rest_framework import generics, permissions, filters
from django_filters.rest_framework import DjangoFilterBackend
from ..models import ProjectMilestone
from ..serializers import ProjectMilestoneSerializer


class ProjectMilestoneListView(generics.ListCreateAPIView):
    queryset = ProjectMilestone.objects.all()
    serializer_class = ProjectMilestoneSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['project', 'is_completed']
    ordering_fields = ['target_date', 'created_at']
    ordering = ['target_date']


class ProjectMilestoneDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = ProjectMilestone.objects.all()
    serializer_class = ProjectMilestoneSerializer
    permission_classes = [permissions.IsAuthenticated]
