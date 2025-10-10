from rest_framework import generics, permissions, filters
from django_filters.rest_framework import DjangoFilterBackend
from ..models import Expense
from ..serializers import ExpenseSerializer, ExpenseCreateSerializer


class ExpenseListView(generics.ListCreateAPIView):
    queryset = Expense.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'expense_type', 'approved_by', 'recorded_by']
    search_fields = ['expense_number', 'description', 'vendor', 'reference_number']
    ordering_fields = ['date_paid', 'amount', 'created_at']
    ordering = ['-date_paid']
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return ExpenseCreateSerializer
        return ExpenseSerializer
    
    def perform_create(self, serializer):
        serializer.save(recorded_by=self.request.user, approved_by=self.request.user)


class ExpenseDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Expense.objects.all()
    serializer_class = ExpenseSerializer
    permission_classes = [permissions.IsAuthenticated]
