from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    project_type_views,
    project_views,
    media_views,
    event_views,
    milestone_views
)

urlpatterns = [
    path('types/', project_type_views.project_type_list_view, name='project-type-list'),
    path('types/<int:pk>/', project_type_views.ProjectTypeDetailView.as_view(), name='project-type-detail'),
    
    path('', project_views.ProjectListView.as_view(), name='project-list'),
    path('<int:pk>/', project_views.ProjectDetailView.as_view(), name='project-detail'),
    path('stats/', project_views.project_stats_view, name='project-stats'),
    path('progress/', project_views.project_progress_view, name='project-progress'),
    
    path('photos/', media_views.ProjectPhotoListView.as_view(), name='project-photo-list'),
    path('photos/<int:pk>/', media_views.ProjectPhotoDetailView.as_view(), name='project-photo-detail'),
    
    path('receipts/', media_views.ProjectReceiptListView.as_view(), name='project-receipt-list'),
    path('receipts/<int:pk>/', media_views.ProjectReceiptDetailView.as_view(), name='project-receipt-detail'),
    
    path('milestones/', milestone_views.ProjectMilestoneListView.as_view(), name='project-milestone-list'),
    path('milestones/<int:pk>/', milestone_views.ProjectMilestoneDetailView.as_view(), name='project-milestone-detail'),
    
    path('events/', event_views.CommunityEventListView.as_view(), name='community-event-list'),
    path('events/<int:pk>/', event_views.CommunityEventDetailView.as_view(), name='community-event-detail'),
    path('events/upcoming/', event_views.upcoming_events_view, name='upcoming-events'),
    path('events/calendar/', event_views.calendar_events_view, name='calendar-events'),
]
