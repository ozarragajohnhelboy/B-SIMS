from rest_framework import generics, permissions, filters
from django_filters.rest_framework import DjangoFilterBackend
from ..models import IncomeCategory, ExpenseCategory
from ..serializers import IncomeCategorySerializer, ExpenseCategorySerializer


class IncomeCategoryListView(generics.ListCreateAPIView):
    queryset = IncomeCategory.objects.filter(is_active=True)
    serializer_class = IncomeCategorySerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'description']


class IncomeCategoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = IncomeCategory.objects.all()
    serializer_class = IncomeCategorySerializer
    permission_classes = [permissions.IsAuthenticated]


class ExpenseCategoryListView(generics.ListCreateAPIView):
    queryset = ExpenseCategory.objects.filter(is_active=True)
    serializer_class = ExpenseCategorySerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'description']


class ExpenseCategoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = ExpenseCategory.objects.all()
    serializer_class = ExpenseCategorySerializer
    permission_classes = [permissions.IsAuthenticated]
