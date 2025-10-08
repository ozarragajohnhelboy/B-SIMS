from rest_framework import generics, permissions, filters
from django_filters.rest_framework import DjangoFilterBackend
from ..models import Resident
from ..serializers import ResidentSerializer, ResidentCreateSerializer

class ResidentListView(generics.ListCreateAPIView):
    queryset = Resident.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['gender', 'marital_status', 'is_voter', 'is_pwd', 'is_senior_citizen', 'household__purok']
    search_fields = ['first_name', 'last_name', 'middle_name', 'barangay_id', 'household__household_number']
    ordering_fields = ['last_name', 'first_name', 'birth_date', 'created_at']
    ordering = ['last_name', 'first_name']
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return ResidentCreateSerializer
        return ResidentSerializer

class ResidentDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Resident.objects.all()
    serializer_class = ResidentSerializer
    permission_classes = [permissions.IsAuthenticated]
