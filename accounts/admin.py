from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.core.mail import send_mail
from django.utils import timezone
from django.template.loader import render_to_string
from django.conf import settings
from .models import User


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'email', 'role', 'first_name', 'last_name', 'is_approved', 'is_active', 'date_joined')
    list_filter = ('role', 'is_approved', 'is_active', 'is_staff', 'date_joined')
    search_fields = ('username', 'email', 'first_name', 'last_name')
    actions = ['approve_users', 'reject_users']
    
    fieldsets = UserAdmin.fieldsets + (
        ('Additional Info', {'fields': ('role', 'phone_number', 'address')}),
        ('Approval Info', {'fields': ('is_approved', 'approved_by', 'approved_at')}),
    )
    
    add_fieldsets = UserAdmin.add_fieldsets + (
        ('Additional Info', {'fields': ('role', 'phone_number', 'address')}),
    )
    
    readonly_fields = ('approved_by', 'approved_at', 'date_joined', 'last_login')
    
    def approve_users(self, request, queryset):
        updated = 0
        for user in queryset.filter(is_approved=False):
            user.is_approved = True
            user.approved_by = request.user
            user.approved_at = timezone.now()
            user.is_active = True
            user.save()
            
            self.send_approval_email(user)
            updated += 1
        
        self.message_user(request, f'{updated} user(s) successfully approved and notified.')
    approve_users.short_description = 'Approve selected users'
    
    def reject_users(self, request, queryset):
        updated = queryset.filter(is_approved=True).update(
            is_approved=False,
            is_active=False
        )
        self.message_user(request, f'{updated} user(s) rejected.')
    reject_users.short_description = 'Reject selected users'
    
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