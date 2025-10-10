from django.contrib import admin
from .models import IncomeCategory, ExpenseCategory, Income, Expense, FinancialReport, TransparencyBoard


@admin.register(IncomeCategory)
class IncomeCategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'description', 'is_active', 'created_at']
    list_filter = ['is_active', 'created_at']
    search_fields = ['name', 'description']


@admin.register(ExpenseCategory)
class ExpenseCategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'description', 'is_active', 'created_at']
    list_filter = ['is_active', 'created_at']
    search_fields = ['name', 'description']


@admin.register(Income)
class IncomeAdmin(admin.ModelAdmin):
    list_display = ['income_number', 'description', 'amount', 'source', 'date_received', 'recorded_by']
    list_filter = ['category', 'income_type', 'date_received', 'created_at']
    search_fields = ['income_number', 'description', 'source', 'reference_number']
    date_hierarchy = 'date_received'


@admin.register(Expense)
class ExpenseAdmin(admin.ModelAdmin):
    list_display = ['expense_number', 'description', 'amount', 'vendor', 'date_paid', 'approved_by']
    list_filter = ['category', 'expense_type', 'date_paid', 'created_at']
    search_fields = ['expense_number', 'description', 'vendor', 'reference_number']
    date_hierarchy = 'date_paid'


@admin.register(FinancialReport)
class FinancialReportAdmin(admin.ModelAdmin):
    list_display = ['report_number', 'report_type', 'period_start', 'period_end', 'total_income', 'total_expense', 'net_balance', 'is_published']
    list_filter = ['report_type', 'is_published', 'created_at']
    search_fields = ['report_number']
    date_hierarchy = 'period_end'


@admin.register(TransparencyBoard)
class TransparencyBoardAdmin(admin.ModelAdmin):
    list_display = ['title', 'is_published', 'published_at', 'created_by', 'created_at']
    list_filter = ['is_published', 'created_at']
    search_fields = ['title', 'content']
    date_hierarchy = 'created_at'
