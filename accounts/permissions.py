from rest_framework import permissions


class RoleBasedPermission(permissions.BasePermission):
    """
    Custom permission to check user roles for different modules
    """
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        user_role = getattr(request.user, 'role', 'admin')
        
        if user_role == 'admin':
            return True
        
        module_permissions = {
            'residents': ['admin', 'secretary'],
            'documents': ['admin', 'secretary'],
            'blotters': ['admin', 'secretary'],
            'announcements': ['admin', 'secretary'],
            'financial': ['admin', 'treasurer'],
            'projects': ['admin'],
            'reports': ['admin', 'treasurer'],
            'users': ['admin'],
            'settings': ['admin'],
        }
        
        module = getattr(view, 'module', None)
        if module and module in module_permissions:
            return user_role in module_permissions[module]
        
        return True


class AdminOnlyPermission(permissions.BasePermission):
    """
    Permission that only allows admin users
    """
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        return getattr(request.user, 'role', 'admin') == 'admin'


class SecretaryPermission(permissions.BasePermission):
    """
    Permission for secretary and admin users
    """
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        user_role = getattr(request.user, 'role', 'admin')
        return user_role in ['admin', 'secretary']


class TreasurerPermission(permissions.BasePermission):
    """
    Permission for treasurer and admin users
    """
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        user_role = getattr(request.user, 'role', 'admin')
        return user_role in ['admin', 'treasurer']
