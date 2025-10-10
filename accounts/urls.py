from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import UserRegistrationView, UserListView, UserDetailView, login_view, logout_view, profile_view
from .views.user_views import UserListView as UserManagementListView, UserDetailView as UserManagementDetailView

urlpatterns = [
    path('register/', UserRegistrationView.as_view(), name='user-register'),
    path('users/', UserManagementListView.as_view(), name='user-management-list'),
    path('users/<int:pk>/', UserManagementDetailView.as_view(), name='user-management-detail'),
    path('login/', login_view, name='login'),
    path('logout/', logout_view, name='logout'),
    path('profile/', profile_view, name='profile'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token-refresh'),
]
