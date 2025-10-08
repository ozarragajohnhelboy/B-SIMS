from .purok_views import PurokListView, PurokDetailView
from .household_views import HouseholdListView, HouseholdDetailView
from .resident_views import ResidentListView, ResidentDetailView
from .document_views import DocumentTypeListView, DocumentTypeDetailView, DocumentRequestListView, DocumentRequestDetailView
from .blotter_views import BlotterListView, BlotterDetailView
from .stats_views import resident_stats_view, document_stats_view, blotter_stats_view

__all__ = [
    'PurokListView',
    'PurokDetailView',
    'HouseholdListView',
    'HouseholdDetailView',
    'ResidentListView',
    'ResidentDetailView',
    'DocumentTypeListView',
    'DocumentTypeDetailView',
    'DocumentRequestListView',
    'DocumentRequestDetailView',
    'BlotterListView',
    'BlotterDetailView',
    'resident_stats_view',
    'document_stats_view',
    'blotter_stats_view'
]
