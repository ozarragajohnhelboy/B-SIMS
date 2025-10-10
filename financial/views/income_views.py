from rest_framework import generics, permissions, filters
from django_filters.rest_framework import DjangoFilterBackend
from core.utils import log_activity
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
        income = serializer.save(recorded_by=self.request.user)
        log_activity(
            user=self.request.user,
            action='create',
            description=f'Added new income record: ₱{income.amount:,.2f} - {income.income_type}',
            content_object=income,
            ip_address=self.request.META.get('REMOTE_ADDR'),
            user_agent=self.request.META.get('HTTP_USER_AGENT', '')
        )


class IncomeDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Income.objects.all()
    serializer_class = IncomeSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_update(self, serializer):
        income = serializer.save()
        log_activity(
            user=self.request.user,
            action='update',
            description=f'Updated income record: ₱{income.amount:,.2f} - {income.income_type}',
            content_object=income,
            ip_address=self.request.META.get('REMOTE_ADDR'),
            user_agent=self.request.META.get('HTTP_USER_AGENT', '')
        )

    def perform_destroy(self, instance):
        log_activity(
            user=self.request.user,
            action='delete',
            description=f'Deleted income record: ₱{instance.amount:,.2f} - {instance.income_type}',
            ip_address=self.request.META.get('REMOTE_ADDR'),
            user_agent=self.request.META.get('HTTP_USER_AGENT', '')
        )
        instance.delete()
