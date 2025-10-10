from rest_framework import generics, permissions, filters
from django_filters.rest_framework import DjangoFilterBackend
from accounts.permissions import SecretaryPermission
from core.utils import log_activity
from ..models import Blotter
from ..serializers import BlotterSerializer, BlotterCreateSerializer

class BlotterListView(generics.ListCreateAPIView):
    queryset = Blotter.objects.all()
    permission_classes = [SecretaryPermission]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'incident_type']
    search_fields = ['blotter_number', 'complainant_name', 'respondent_name', 'summary']
    ordering_fields = ['incident_date', 'created_at', 'status']
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return BlotterCreateSerializer
        return BlotterSerializer
    
    def perform_create(self, serializer):
        blotter = serializer.save(recorded_by=self.request.user)
        log_activity(
            user=self.request.user,
            action='create',
            description=f'Created new blotter entry: {blotter.incident_type} - {blotter.complainant_name} vs {blotter.respondent_name}',
            content_object=blotter,
            ip_address=self.request.META.get('REMOTE_ADDR'),
            user_agent=self.request.META.get('HTTP_USER_AGENT', '')
        )

class BlotterDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Blotter.objects.all()
    permission_classes = [SecretaryPermission]

    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return BlotterCreateSerializer
        return BlotterSerializer

    def perform_update(self, serializer):
        blotter = serializer.save()
        log_activity(
            user=self.request.user,
            action='update',
            description=f'Updated blotter entry: {blotter.incident_type} - {blotter.complainant_name} vs {blotter.respondent_name}',
            content_object=blotter,
            ip_address=self.request.META.get('REMOTE_ADDR'),
            user_agent=self.request.META.get('HTTP_USER_AGENT', '')
        )

    def perform_destroy(self, instance):
        log_activity(
            user=self.request.user,
            action='delete',
            description=f'Deleted blotter entry: {instance.incident_type} - {instance.complainant_name} vs {instance.respondent_name}',
            ip_address=self.request.META.get('REMOTE_ADDR'),
            user_agent=self.request.META.get('HTTP_USER_AGENT', '')
        )
        instance.delete()
