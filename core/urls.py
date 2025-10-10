from django.urls import path
from .views import ConfigurationListView, ConfigurationDetailView, settings_view
from .views.activity_views import ActivityLogListView, recent_activities

urlpatterns = [
    path('configurations/', ConfigurationListView.as_view(), name='configuration-list'),
    path('configurations/<int:pk>/', ConfigurationDetailView.as_view(), name='configuration-detail'),
    path('settings/', settings_view, name='settings'),
    path('activities/', ActivityLogListView.as_view(), name='activity-list'),
    path('activities/recent/', recent_activities, name='recent-activities'),
]
