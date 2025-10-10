from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    category_views,
    income_views,
    expense_views,
    report_views,
    transparency_views
)

urlpatterns = [
    path('income-categories/', category_views.IncomeCategoryListView.as_view(), name='income-category-list'),
    path('income-categories/<int:pk>/', category_views.IncomeCategoryDetailView.as_view(), name='income-category-detail'),
    path('expense-categories/', category_views.ExpenseCategoryListView.as_view(), name='expense-category-list'),
    path('expense-categories/<int:pk>/', category_views.ExpenseCategoryDetailView.as_view(), name='expense-category-detail'),
    
    path('incomes/', income_views.IncomeListView.as_view(), name='income-list'),
    path('incomes/<int:pk>/', income_views.IncomeDetailView.as_view(), name='income-detail'),
    
    path('expenses/', expense_views.ExpenseListView.as_view(), name='expense-list'),
    path('expenses/<int:pk>/', expense_views.ExpenseDetailView.as_view(), name='expense-detail'),
    
    path('reports/', report_views.FinancialReportListView.as_view(), name='financial-report-list'),
    path('reports/<int:pk>/', report_views.FinancialReportDetailView.as_view(), name='financial-report-detail'),
    path('reports/generate-monthly/', report_views.generate_monthly_report, name='generate-monthly-report'),
    path('reports/generate-quarterly/', report_views.generate_quarterly_report, name='generate-quarterly-report'),
    path('reports/summary/', report_views.financial_summary, name='financial-summary'),
    
    path('transparency/', transparency_views.TransparencyBoardListView.as_view(), name='transparency-board-list'),
    path('transparency/<int:pk>/', transparency_views.TransparencyBoardDetailView.as_view(), name='transparency-board-detail'),
    path('transparency/public/', transparency_views.PublicTransparencyBoardListView.as_view(), name='public-transparency-board'),
]
