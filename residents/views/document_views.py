from rest_framework import generics, permissions, filters
from django_filters.rest_framework import DjangoFilterBackend
from accounts.permissions import SecretaryPermission
from core.utils import log_activity
from ..models import DocumentType, DocumentRequest, Resident
from ..serializers import DocumentTypeSerializer, DocumentRequestSerializer, DocumentRequestCreateSerializer

class DocumentTypeListView(generics.ListCreateAPIView):
    queryset = DocumentType.objects.filter(is_active=True)
    serializer_class = DocumentTypeSerializer
    permission_classes = [SecretaryPermission]
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'description']

class DocumentTypeDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = DocumentType.objects.all()
    serializer_class = DocumentTypeSerializer
    permission_classes = [SecretaryPermission]

class DocumentRequestListView(generics.ListCreateAPIView):
    queryset = DocumentRequest.objects.all()
    permission_classes = [SecretaryPermission]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'document_type', 'resident']
    search_fields = ['request_number', 'resident__first_name', 'resident__last_name', 'purpose']
    ordering_fields = ['created_at', 'status']
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return DocumentRequestCreateSerializer
        return DocumentRequestSerializer
    
    def perform_create(self, serializer):
        document_request = serializer.save(requested_by=self.request.user)
        log_activity(
            user=self.request.user,
            action='create',
            description=f'Created new document request: {document_request.document_type.name} for {document_request.resident.first_name} {document_request.resident.last_name}',
            content_object=document_request,
            ip_address=self.request.META.get('REMOTE_ADDR'),
            user_agent=self.request.META.get('HTTP_USER_AGENT', '')
        )

class DocumentRequestDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = DocumentRequest.objects.all()
    permission_classes = [SecretaryPermission]

    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return DocumentRequestCreateSerializer
        return DocumentRequestSerializer

    def perform_update(self, serializer):
        document_request = serializer.save()
        log_activity(
            user=self.request.user,
            action='update',
            description=f'Updated document request: {document_request.document_type.name} for {document_request.resident.first_name} {document_request.resident.last_name}',
            content_object=document_request,
            ip_address=self.request.META.get('REMOTE_ADDR'),
            user_agent=self.request.META.get('HTTP_USER_AGENT', '')
        )

    def perform_destroy(self, instance):
        log_activity(
            user=self.request.user,
            action='delete',
            description=f'Deleted document request: {instance.document_type.name} for {instance.resident.first_name} {instance.resident.last_name}',
            ip_address=self.request.META.get('REMOTE_ADDR'),
            user_agent=self.request.META.get('HTTP_USER_AGENT', '')
        )
        instance.delete()


# Mobile endpoints (resident-facing)
class MobileDocumentTypeListView(generics.ListAPIView):
    queryset = DocumentType.objects.filter(is_active=True)
    serializer_class = DocumentTypeSerializer
    permission_classes = [permissions.IsAuthenticated]


class MobileDocumentRequestListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['status', 'document_type']
    ordering_fields = ['created_at', 'status']
    ordering = ['-created_at']

    def get_queryset(self):
        # Show only the current user's requests
        return DocumentRequest.objects.filter(resident__user=self.request.user)

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return DocumentRequestCreateSerializer
        return DocumentRequestSerializer

    def perform_create(self, serializer):
        from django.db import transaction
        
        resident = Resident.objects.get(user=self.request.user)
        document_type_id = serializer.validated_data.get('document_type')
        
        # Get the document type's required fee
        document_type = DocumentType.objects.get(id=document_type_id.id)
        required_fee = document_type.required_fee
        
        serializer.save(
            resident=resident,
            requested_by=self.request.user,
            status='pending',
            fee_paid=required_fee
        )
