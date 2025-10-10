from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from accounts.permissions import AdminOnlyPermission
from core.utils import log_activity
from ..serializers import UserSerializer, UserCreateSerializer, UserRegistrationSerializer

User = get_user_model()


class UserRegistrationView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [AllowAny]


class UserListView(generics.ListCreateAPIView):
    queryset = User.objects.all()
    permission_classes = [AdminOnlyPermission]
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return UserCreateSerializer
        return UserSerializer

    def perform_create(self, serializer):
        user = serializer.save()
        log_activity(
            user=self.request.user,
            action='create',
            description=f'Created new user account: {user.first_name} {user.last_name} ({user.role})',
            content_object=user,
            ip_address=self.request.META.get('REMOTE_ADDR'),
            user_agent=self.request.META.get('HTTP_USER_AGENT', '')
        )


class UserDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = User.objects.all()
    permission_classes = [AdminOnlyPermission]

    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return UserCreateSerializer
        return UserSerializer

    def perform_update(self, serializer):
        user = serializer.save()
        log_activity(
            user=self.request.user,
            action='update',
            description=f'Updated user account: {user.first_name} {user.last_name} ({user.role})',
            content_object=user,
            ip_address=self.request.META.get('REMOTE_ADDR'),
            user_agent=self.request.META.get('HTTP_USER_AGENT', '')
        )

    def perform_destroy(self, instance):
        user_name = f"{instance.first_name} {instance.last_name}"
        log_activity(
            user=self.request.user,
            action='delete',
            description=f'Deleted user account: {user_name} ({instance.role})',
            ip_address=self.request.META.get('REMOTE_ADDR'),
            user_agent=self.request.META.get('HTTP_USER_AGENT', '')
        )
        instance.delete()