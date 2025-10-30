from rest_framework import generics, permissions
from django_filters.rest_framework import DjangoFilterBackend
from accounts.permissions import SecretaryPermission
from core.utils import log_activity
from ..models import Complaint, ComplaintAttachment, Resident
from ..serializers import ComplaintSerializer, ComplaintCreateSerializer, ComplaintAttachmentSerializer


class ComplaintListView(generics.ListCreateAPIView):
    serializer_class = ComplaintSerializer
    permission_classes = [SecretaryPermission]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['status']

    def get_queryset(self):
        return Complaint.objects.select_related('submitted_by', 'responded_by', 'submitted_by__user').prefetch_related('attachments').all()
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return ComplaintCreateSerializer
        return ComplaintSerializer

    def perform_create(self, serializer):
        complaint = serializer.save()
        log_activity(
            user=self.request.user,
            action='create',
            description=f'Created complaint: {complaint.title}',
            content_object=complaint,
            ip_address=self.request.META.get('REMOTE_ADDR'),
            user_agent=self.request.META.get('HTTP_USER_AGENT', '')
        )


class ComplaintDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Complaint.objects.all()
    serializer_class = ComplaintSerializer
    permission_classes = [SecretaryPermission]
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return ComplaintCreateSerializer
        return ComplaintSerializer

    def perform_update(self, serializer):
        from django.utils import timezone
        if 'response' in serializer.validated_data:
            serializer.validated_data['responded_by'] = self.request.user
            serializer.validated_data['responded_at'] = timezone.now()
        complaint = serializer.save()
        log_activity(
            user=self.request.user,
            action='update',
            description=f'Updated complaint: {complaint.title}',
            content_object=complaint,
            ip_address=self.request.META.get('REMOTE_ADDR'),
            user_agent=self.request.META.get('HTTP_USER_AGENT', '')
        )

    def perform_destroy(self, instance):
        log_activity(
            user=self.request.user,
            action='delete',
            description=f'Deleted complaint: {instance.title}',
            content_object=instance,
            ip_address=self.request.META.get('REMOTE_ADDR'),
            user_agent=self.request.META.get('HTTP_USER_AGENT', '')
        )
        instance.delete()


class MobileComplaintListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['status']

    def get_queryset(self):
        return Complaint.objects.filter(submitted_by__user=self.request.user).prefetch_related('attachments')

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return ComplaintCreateSerializer
        return ComplaintSerializer

    def perform_create(self, serializer):
        resident = Resident.objects.get(user=self.request.user)
        complaint = serializer.save(submitted_by=resident, status='received')
        
        if hasattr(self.request, 'FILES'):
            images = self.request.FILES.getlist('images')
            for image in images:
                ComplaintAttachment.objects.create(
                    complaint=complaint,
                    image=image
                )
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context


class MobileComplaintDetailView(generics.RetrieveAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ComplaintSerializer

    def get_queryset(self):
        return Complaint.objects.filter(submitted_by__user=self.request.user).prefetch_related('attachments')
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context
