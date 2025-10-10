from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from core.utils import log_activity
from ..serializers import UserSerializer, LoginSerializer

User = get_user_model()

@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    serializer = LoginSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.validated_data['user']
        refresh = RefreshToken.for_user(user)
        
        log_activity(
            user=user,
            action='login',
            description=f'User logged in successfully',
            ip_address=request.META.get('REMOTE_ADDR'),
            user_agent=request.META.get('HTTP_USER_AGENT', '')
        )
        
        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'user': UserSerializer(user).data
        })
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    try:
        refresh_token = request.data["refresh"]
        token = RefreshToken(refresh_token)
        token.blacklist()
        return Response(status=status.HTTP_205_RESET_CONTENT)
    except Exception as e:
        return Response(status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password_view(request):
    current_password = request.data.get('current_password')
    new_password = request.data.get('new_password')
    
    if not current_password or not new_password:
        return Response(
            {'message': 'Current password and new password are required'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    if not request.user.check_password(current_password):
        return Response(
            {'message': 'Current password is incorrect'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    request.user.set_password(new_password)
    request.user.save()
    
    log_activity(
        user=request.user,
        action='update',
        description=f'User changed password',
        ip_address=request.META.get('REMOTE_ADDR'),
        user_agent=request.META.get('HTTP_USER_AGENT', '')
    )
    
    return Response({'message': 'Password changed successfully'})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def profile_view(request):
    serializer = UserSerializer(request.user)
    return Response(serializer.data)
