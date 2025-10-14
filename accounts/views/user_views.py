from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.core.mail import send_mail
from django.conf import settings
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
        return UserSerializer

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        
        if 'is_approved' in request.data:
            is_approving = request.data.get('is_approved') == True
            
            if is_approving and not instance.is_approved:
                instance.is_approved = True
                instance.is_active = request.data.get('is_active', True)
                instance.approved_by = request.user
                instance.approved_at = timezone.now()
                instance.save()
                
                self.send_approval_email(instance)
                
                log_activity(
                    user=request.user,
                    action='approve',
                    description=f'Approved user account: {instance.first_name} {instance.last_name}',
                    content_object=instance,
                    ip_address=request.META.get('REMOTE_ADDR'),
                    user_agent=request.META.get('HTTP_USER_AGENT', '')
                )
            else:
                instance.is_approved = request.data.get('is_approved', instance.is_approved)
                instance.is_active = request.data.get('is_active', instance.is_active)
                instance.save()
            
            serializer = self.get_serializer(instance)
            return Response(serializer.data)
        
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        
        return Response(serializer.data)
    
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

    def send_approval_email(self, user):
        try:
            subject = 'Account Approved - Barangay Information Management System'
            message = f"""
Dear {user.first_name} {user.last_name},

Your account has been approved!

Username: {user.username}
Email: {user.email}
Role: {user.get_role_display()}

You can now log in to the Barangay Information Management System.

Thank you,
Barangay Administration
"""
            send_mail(
                subject,
                message,
                settings.DEFAULT_FROM_EMAIL,
                [user.email],
                fail_silently=False,
            )
        except Exception as e:
            print(f'Failed to send approval email to {user.email}: {str(e)}')

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