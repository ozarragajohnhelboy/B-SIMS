from rest_framework import generics, permissions, filters
from django_filters.rest_framework import DjangoFilterBackend
from accounts.permissions import TreasurerPermission
from core.utils import log_activity
from ..models import Expense
from ..serializers import ExpenseSerializer, ExpenseCreateSerializer


class ExpenseListView(generics.ListCreateAPIView):
    queryset = Expense.objects.all()
    permission_classes = [TreasurerPermission]
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
        expense = serializer.save(recorded_by=self.request.user, approved_by=self.request.user)
        log_activity(
            user=self.request.user,
            action='create',
            description=f'Added new expense record: ₱{expense.amount:,.2f} - {expense.expense_type}',
            content_object=expense,
            ip_address=self.request.META.get('REMOTE_ADDR'),
            user_agent=self.request.META.get('HTTP_USER_AGENT', '')
        )


class ExpenseDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Expense.objects.all()
    serializer_class = ExpenseSerializer
    permission_classes = [TreasurerPermission]

    def perform_update(self, serializer):
        expense = serializer.save()
        log_activity(
            user=self.request.user,
            action='update',
            description=f'Updated expense record: ₱{expense.amount:,.2f} - {expense.expense_type}',
            content_object=expense,
            ip_address=self.request.META.get('REMOTE_ADDR'),
            user_agent=self.request.META.get('HTTP_USER_AGENT', '')
        )

    def perform_destroy(self, instance):
        log_activity(
            user=self.request.user,
            action='delete',
            description=f'Deleted expense record: ₱{instance.amount:,.2f} - {instance.expense_type}',
            ip_address=self.request.META.get('REMOTE_ADDR'),
            user_agent=self.request.META.get('HTTP_USER_AGENT', '')
        )
        instance.delete()
