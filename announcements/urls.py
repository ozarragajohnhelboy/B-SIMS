from django.urls import path
from .views import (
    AnnouncementCategoryListView, AnnouncementCategoryDetailView, announcement_category_stats,
    AnnouncementListView, AnnouncementDetailView, track_announcement_view, announcement_stats,
    publish_announcement, archive_announcement,
    NotificationTemplateListView, NotificationTemplateDetailView, send_notification
)

urlpatterns = [
    path('categories/', AnnouncementCategoryListView.as_view(), name='announcement-category-list'),
    path('categories/<int:pk>/', AnnouncementCategoryDetailView.as_view(), name='announcement-category-detail'),
    path('categories/stats/', announcement_category_stats, name='announcement-category-stats'),
    
    path('', AnnouncementListView.as_view(), name='announcement-list'),
    path('<int:pk>/', AnnouncementDetailView.as_view(), name='announcement-detail'),
    path('<int:pk>/track-view/', track_announcement_view, name='track-announcement-view'),
    path('<int:pk>/publish/', publish_announcement, name='publish-announcement'),
    path('<int:pk>/archive/', archive_announcement, name='archive-announcement'),
    path('stats/', announcement_stats, name='announcement-stats'),
    
    path('templates/', NotificationTemplateListView.as_view(), name='notification-template-list'),
    path('templates/<int:pk>/', NotificationTemplateDetailView.as_view(), name='notification-template-detail'),
    path('templates/<int:pk>/send/', send_notification, name='send-notification'),
]
