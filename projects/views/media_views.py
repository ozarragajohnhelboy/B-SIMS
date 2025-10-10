from rest_framework import generics, permissions, filters
from django_filters.rest_framework import DjangoFilterBackend
from ..models import ProjectPhoto, ProjectReceipt
from ..serializers import ProjectPhotoSerializer, ProjectReceiptSerializer


class ProjectPhotoListView(generics.ListCreateAPIView):
    queryset = ProjectPhoto.objects.all()
    serializer_class = ProjectPhotoSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['project']
    ordering_fields = ['uploaded_at']
    ordering = ['-uploaded_at']
    
    def perform_create(self, serializer):
        serializer.save(uploaded_by=self.request.user)


class ProjectPhotoDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = ProjectPhoto.objects.all()
    serializer_class = ProjectPhotoSerializer
    permission_classes = [permissions.IsAuthenticated]


class ProjectReceiptListView(generics.ListCreateAPIView):
    queryset = ProjectReceipt.objects.all()
    serializer_class = ProjectReceiptSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['project']
    ordering_fields = ['receipt_date', 'uploaded_at']
    ordering = ['-receipt_date']
    
    def perform_create(self, serializer):
        serializer.save(uploaded_by=self.request.user)


class ProjectReceiptDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = ProjectReceipt.objects.all()
    serializer_class = ProjectReceiptSerializer
    permission_classes = [permissions.IsAuthenticated]
