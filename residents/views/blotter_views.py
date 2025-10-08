from rest_framework import generics, permissions, filters
from django_filters.rest_framework import DjangoFilterBackend
from ..models import Blotter
from ..serializers import BlotterSerializer

class BlotterListView(generics.ListCreateAPIView):
    queryset = Blotter.objects.all()
    serializer_class = BlotterSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'incident_type']
    search_fields = ['blotter_number', 'complainant_name', 'respondent_name', 'summary']
    ordering_fields = ['incident_date', 'created_at', 'status']
    ordering = ['-created_at']
    
    def perform_create(self, serializer):
        serializer.save(recorded_by=self.request.user)

class BlotterDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Blotter.objects.all()
    serializer_class = BlotterSerializer
    permission_classes = [permissions.IsAuthenticated]
