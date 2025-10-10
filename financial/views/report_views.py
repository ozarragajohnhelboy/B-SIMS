from rest_framework import generics, permissions, filters
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.db.models import Sum, Q
from datetime import datetime, timedelta
from ..models import FinancialReport, Income, Expense
from ..serializers import FinancialReportSerializer


class FinancialReportListView(generics.ListCreateAPIView):
    queryset = FinancialReport.objects.all()
    serializer_class = FinancialReportSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['report_type', 'is_published']
    search_fields = ['report_number']
    ordering_fields = ['period_start', 'period_end', 'created_at']
    ordering = ['-period_end']
    
    def perform_create(self, serializer):
        serializer.save(generated_by=self.request.user)


class FinancialReportDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = FinancialReport.objects.all()
    serializer_class = FinancialReportSerializer
    permission_classes = [permissions.IsAuthenticated]


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def generate_monthly_report(request):
    year = request.data.get('year')
    month = request.data.get('month')
    
    if not year or not month:
        return Response({'error': 'Year and month are required'}, status=400)
    
    start_date = datetime(int(year), int(month), 1).date()
    if int(month) == 12:
        end_date = datetime(int(year) + 1, 1, 1).date() - timedelta(days=1)
    else:
        end_date = datetime(int(year), int(month) + 1, 1).date() - timedelta(days=1)
    
    total_income = Income.objects.filter(
        date_received__gte=start_date,
        date_received__lte=end_date
    ).aggregate(total=Sum('amount'))['total'] or 0
    
    total_expense = Expense.objects.filter(
        date_paid__gte=start_date,
        date_paid__lte=end_date
    ).aggregate(total=Sum('amount'))['total'] or 0
    
    report = FinancialReport.objects.create(
        report_type='monthly',
        period_start=start_date,
        period_end=end_date,
        total_income=total_income,
        total_expense=total_expense,
        generated_by=request.user
    )
    
    serializer = FinancialReportSerializer(report)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def generate_quarterly_report(request):
    year = request.data.get('year')
    quarter = request.data.get('quarter')
    
    if not year or not quarter:
        return Response({'error': 'Year and quarter are required'}, status=400)
    
    quarter_start_month = (int(quarter) - 1) * 3 + 1
    start_date = datetime(int(year), quarter_start_month, 1).date()
    
    if quarter_start_month == 10:
        end_date = datetime(int(year) + 1, 1, 1).date() - timedelta(days=1)
    else:
        end_date = datetime(int(year), quarter_start_month + 3, 1).date() - timedelta(days=1)
    
    total_income = Income.objects.filter(
        date_received__gte=start_date,
        date_received__lte=end_date
    ).aggregate(total=Sum('amount'))['total'] or 0
    
    total_expense = Expense.objects.filter(
        date_paid__gte=start_date,
        date_paid__lte=end_date
    ).aggregate(total=Sum('amount'))['total'] or 0
    
    report = FinancialReport.objects.create(
        report_type='quarterly',
        period_start=start_date,
        period_end=end_date,
        total_income=total_income,
        total_expense=total_expense,
        generated_by=request.user
    )
    
    serializer = FinancialReportSerializer(report)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def financial_summary(request):
    current_year = datetime.now().year
    
    monthly_data = []
    for month in range(1, 13):
        start_date = datetime(current_year, month, 1).date()
        if month == 12:
            end_date = datetime(current_year + 1, 1, 1).date() - timedelta(days=1)
        else:
            end_date = datetime(current_year, month + 1, 1).date() - timedelta(days=1)
        
        income = Income.objects.filter(
            date_received__gte=start_date,
            date_received__lte=end_date
        ).aggregate(total=Sum('amount'))['total'] or 0
        
        expense = Expense.objects.filter(
            date_paid__gte=start_date,
            date_paid__lte=end_date
        ).aggregate(total=Sum('amount'))['total'] or 0
        
        monthly_data.append({
            'month': month,
            'income': float(income),
            'expense': float(expense),
            'balance': float(income - expense)
        })
    
    total_income = Income.objects.filter(
        date_received__year=current_year
    ).aggregate(total=Sum('amount'))['total'] or 0
    
    total_expense = Expense.objects.filter(
        date_paid__year=current_year
    ).aggregate(total=Sum('amount'))['total'] or 0
    
    return Response({
        'year': current_year,
        'total_income': float(total_income),
        'total_expense': float(total_expense),
        'net_balance': float(total_income - total_expense),
        'monthly_data': monthly_data
    })
