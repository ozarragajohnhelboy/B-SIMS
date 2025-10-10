from django.urls import path
from .views import (
    PurokListView, PurokDetailView,
    HouseholdListView, HouseholdDetailView,
    ResidentListView, ResidentDetailView,
    DocumentTypeListView, DocumentTypeDetailView,
    DocumentRequestListView, DocumentRequestDetailView,
    BlotterListView, BlotterDetailView,
    resident_stats_view, document_stats_view, blotter_stats_view
)
from .views.stats_views import dashboard_stats

urlpatterns = [
    path('puroks/', PurokListView.as_view(), name='purok-list'),
    path('puroks/<int:pk>/', PurokDetailView.as_view(), name='purok-detail'),
    path('households/', HouseholdListView.as_view(), name='household-list'),
    path('households/<int:pk>/', HouseholdDetailView.as_view(), name='household-detail'),
    path('', ResidentListView.as_view(), name='resident-list'),
    path('<int:pk>/', ResidentDetailView.as_view(), name='resident-detail'),
    path('stats/', resident_stats_view, name='resident-stats'),
    path('dashboard-stats/', dashboard_stats, name='dashboard-stats'),
    path('documents/types/', DocumentTypeListView.as_view(), name='document-type-list'),
    path('documents/types/<int:pk>/', DocumentTypeDetailView.as_view(), name='document-type-detail'),
    path('documents/requests/', DocumentRequestListView.as_view(), name='document-request-list'),
    path('documents/requests/<int:pk>/', DocumentRequestDetailView.as_view(), name='document-request-detail'),
    path('documents/stats/', document_stats_view, name='document-stats'),
    path('blotters/', BlotterListView.as_view(), name='blotter-list'),
    path('blotters/<int:pk>/', BlotterDetailView.as_view(), name='blotter-detail'),
    path('blotters/stats/', blotter_stats_view, name='blotter-stats'),
]
