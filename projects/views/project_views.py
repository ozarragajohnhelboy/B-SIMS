from rest_framework import generics, permissions, filters
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.db.models import Count, Q, Sum
from django.utils import timezone
from django.db import models
from accounts.permissions import AdminOnlyPermission
from core.utils import log_activity
from ..models import Project
from ..serializers import ProjectSerializer, ProjectCreateSerializer


class ProjectListView(generics.ListCreateAPIView):
    queryset = Project.objects.all()
    permission_classes = [AdminOnlyPermission]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'priority', 'project_type', 'is_public']
    search_fields = ['title', 'description', 'location', 'project_number']
    ordering_fields = ['created_at', 'start_date', 'end_date', 'progress_percentage']
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return ProjectCreateSerializer
        return ProjectSerializer
    
    def perform_create(self, serializer):
        project = serializer.save(created_by=self.request.user, project_manager=self.request.user)
        log_activity(
            user=self.request.user,
            action='create',
            description=f'Created new project: {project.title} (₱{project.budget_allocated:,.2f})',
            content_object=project,
            ip_address=self.request.META.get('REMOTE_ADDR'),
            user_agent=self.request.META.get('HTTP_USER_AGENT', '')
        )


class ProjectDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer
    permission_classes = [AdminOnlyPermission]

    def perform_update(self, serializer):
        project = serializer.save()
        log_activity(
            user=self.request.user,
            action='update',
            description=f'Updated project: {project.title} (₱{project.budget_allocated:,.2f})',
            content_object=project,
            ip_address=self.request.META.get('REMOTE_ADDR'),
            user_agent=self.request.META.get('HTTP_USER_AGENT', '')
        )

    def perform_destroy(self, instance):
        log_activity(
            user=self.request.user,
            action='delete',
            description=f'Deleted project: {instance.title} (₱{instance.budget_allocated:,.2f})',
            ip_address=self.request.META.get('REMOTE_ADDR'),
            user_agent=self.request.META.get('HTTP_USER_AGENT', '')
        )
        instance.delete()


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def project_stats_view(request):
    total_projects = Project.objects.count()
    ongoing_projects = Project.objects.filter(status='ongoing').count()
    completed_projects = Project.objects.filter(status='completed').count()
    overdue_projects = Project.objects.filter(status='ongoing').filter(end_date__lt=timezone.now().date()).count()
    
    total_budget = Project.objects.aggregate(total=models.Sum('budget_allocated'))['total'] or 0
    total_spent = Project.objects.aggregate(total=models.Sum('budget_spent'))['total'] or 0
    
    status_stats = Project.objects.values('status').annotate(count=Count('id'))
    type_stats = Project.objects.values('project_type__name').annotate(count=Count('id'))
    
    return Response({
        'total_projects': total_projects,
        'ongoing_projects': ongoing_projects,
        'completed_projects': completed_projects,
        'overdue_projects': overdue_projects,
        'total_budget': float(total_budget),
        'total_spent': float(total_spent),
        'budget_remaining': float(total_budget - total_spent),
        'status_distribution': list(status_stats),
        'type_distribution': list(type_stats),
    })


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def project_progress_view(request):
    projects = Project.objects.filter(status__in=['ongoing', 'planning']).order_by('-progress_percentage')
    serializer = ProjectSerializer(projects, many=True)
    return Response(serializer.data)


class MobileProjectListView(generics.ListAPIView):
    serializer_class = ProjectSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Project.objects.select_related('project_type', 'project_manager', 'created_by').filter(
            is_public=True
        ).order_by('-created_at')


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def mobile_project_stats_view(request):
    public_projects = Project.objects.filter(is_public=True)
    total_projects = public_projects.count()
    ongoing_projects = public_projects.filter(status='ongoing').count()
    completed_projects = public_projects.filter(status='completed').count()
    total_budget = public_projects.aggregate(total=models.Sum('budget_allocated'))['total'] or 0
    
    return Response({
        'total_projects': total_projects,
        'ongoing_projects': ongoing_projects,
        'completed_projects': completed_projects,
        'total_budget': float(total_budget),
    })
