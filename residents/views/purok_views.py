from rest_framework import generics, permissions, filters
from django_filters.rest_framework import DjangoFilterBackend
from ..models import Purok
from ..serializers import PurokSerializer

class PurokListView(generics.ListCreateAPIView):
    queryset = Purok.objects.all()
    serializer_class = PurokSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'description']

class PurokDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Purok.objects.all()
    serializer_class = PurokSerializer
    permission_classes = [permissions.IsAuthenticated]
