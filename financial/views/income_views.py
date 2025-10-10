from rest_framework import generics, permissions, filters
from django_filters.rest_framework import DjangoFilterBackend
from ..models import Income
from ..serializers import IncomeSerializer, IncomeCreateSerializer


class IncomeListView(generics.ListCreateAPIView):
    queryset = Income.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'income_type', 'recorded_by']
    search_fields = ['income_number', 'description', 'source', 'reference_number']
    ordering_fields = ['date_received', 'amount', 'created_at']
    ordering = ['-date_received']
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return IncomeCreateSerializer
        return IncomeSerializer
    
    def perform_create(self, serializer):
        serializer.save(recorded_by=self.request.user)


class IncomeDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Income.objects.all()
    serializer_class = IncomeSerializer
    permission_classes = [permissions.IsAuthenticated]
