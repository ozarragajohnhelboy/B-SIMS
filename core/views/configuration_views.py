from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.db.models import Q
from ..models import Configuration
from ..serializers import ConfigurationSerializer, ConfigurationCreateSerializer

class ConfigurationListView(generics.ListCreateAPIView):
    queryset = Configuration.objects.all()
    serializer_class = ConfigurationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return ConfigurationCreateSerializer
        return ConfigurationSerializer

class ConfigurationDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Configuration.objects.all()
    serializer_class = ConfigurationSerializer
    permission_classes = [permissions.IsAuthenticated]

@api_view(['GET', 'POST'])
@permission_classes([permissions.IsAuthenticated])
def settings_view(request):
    if request.method == 'GET':
        settings = {}
        configurations = Configuration.objects.all()
        for config in configurations:
            settings[config.key] = config.value
        return Response(settings)
    
    elif request.method == 'POST':
        settings_data = request.data
        
        for key, value in settings_data.items():
            config, created = Configuration.objects.get_or_create(
                key=key,
                defaults={'value': str(value), 'description': f'Setting for {key}'}
            )
            if not created:
                config.value = str(value)
                config.save()
        
        return Response({'message': 'Settings updated successfully'}, status=status.HTTP_200_OK)
