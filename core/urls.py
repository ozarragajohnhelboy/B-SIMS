from django.urls import path
from .views import ConfigurationListView, ConfigurationDetailView, settings_view

urlpatterns = [
    path('configurations/', ConfigurationListView.as_view(), name='configuration-list'),
    path('configurations/<int:pk>/', ConfigurationDetailView.as_view(), name='configuration-detail'),
    path('settings/', settings_view, name='settings'),
]
