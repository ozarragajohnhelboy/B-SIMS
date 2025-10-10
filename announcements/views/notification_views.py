from rest_framework import generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Q
from ..models import NotificationTemplate
from ..serializers import NotificationTemplateSerializer, NotificationTemplateCreateSerializer


class NotificationTemplateListView(generics.ListCreateAPIView):
    queryset = NotificationTemplate.objects.filter(is_active=True)
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return NotificationTemplateCreateSerializer
        return NotificationTemplateSerializer

    def get_queryset(self):
        queryset = NotificationTemplate.objects.all()
        search = self.request.query_params.get('search', None)
        category_filter = self.request.query_params.get('category', None)
        
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) | 
                Q(subject__icontains=search) |
                Q(message__icontains=search)
            )
        if category_filter:
            queryset = queryset.filter(category_id=category_filter)
        
        return queryset.order_by('name')


class NotificationTemplateDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = NotificationTemplate.objects.all()
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return NotificationTemplateCreateSerializer
        return NotificationTemplateSerializer


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def send_notification(request, template_id):
    template = NotificationTemplate.objects.get(pk=template_id)
    
    recipients = request.data.get('recipients', [])
    custom_message = request.data.get('custom_message', '')
    
    message = custom_message if custom_message else template.message
    
    return Response({
        'status': 'success',
        'message': 'Notification sent successfully',
        'recipients_count': len(recipients)
    })
