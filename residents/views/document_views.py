from rest_framework import generics, permissions, filters
from django_filters.rest_framework import DjangoFilterBackend
from ..models import DocumentType, DocumentRequest
from ..serializers import DocumentTypeSerializer, DocumentRequestSerializer

class DocumentTypeListView(generics.ListCreateAPIView):
    queryset = DocumentType.objects.filter(is_active=True)
    serializer_class = DocumentTypeSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'description']

class DocumentTypeDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = DocumentType.objects.all()
    serializer_class = DocumentTypeSerializer
    permission_classes = [permissions.IsAuthenticated]

class DocumentRequestListView(generics.ListCreateAPIView):
    queryset = DocumentRequest.objects.all()
    serializer_class = DocumentRequestSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'document_type', 'resident']
    search_fields = ['request_number', 'resident__first_name', 'resident__last_name', 'purpose']
    ordering_fields = ['created_at', 'status']
    ordering = ['-created_at']
    
    def perform_create(self, serializer):
        serializer.save(requested_by=self.request.user)

class DocumentRequestDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = DocumentRequest.objects.all()
    serializer_class = DocumentRequestSerializer
    permission_classes = [permissions.IsAuthenticated]
