from rest_framework import generics, permissions, filters
from django_filters.rest_framework import DjangoFilterBackend
from accounts.permissions import SecretaryPermission
from core.utils import log_activity
from ..models import Resident, Purok, Household
from ..serializers import ResidentSerializer, ResidentCreateSerializer, PurokSerializer, HouseholdSerializer

class ResidentListView(generics.ListCreateAPIView):
    queryset = Resident.objects.all()
    permission_classes = [SecretaryPermission]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['gender', 'marital_status', 'is_voter', 'is_pwd', 'is_senior_citizen', 'household__purok']
    search_fields = ['first_name', 'last_name', 'middle_name', 'barangay_id', 'household__household_number']
    ordering_fields = ['last_name', 'first_name', 'birth_date', 'created_at']
    ordering = ['last_name', 'first_name']
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return ResidentCreateSerializer
        return ResidentSerializer

    def perform_create(self, serializer):
        resident = serializer.save()
        log_activity(
            user=self.request.user,
            action='create',
            description=f'Created new resident: {resident.first_name} {resident.last_name}',
            content_object=resident,
            ip_address=self.request.META.get('REMOTE_ADDR'),
            user_agent=self.request.META.get('HTTP_USER_AGENT', '')
        )

class ResidentDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Resident.objects.all()
    serializer_class = ResidentSerializer
    permission_classes = [SecretaryPermission]

    def perform_update(self, serializer):
        resident = serializer.save()
        log_activity(
            user=self.request.user,
            action='update',
            description=f'Updated resident information: {resident.first_name} {resident.last_name}',
            content_object=resident,
            ip_address=self.request.META.get('REMOTE_ADDR'),
            user_agent=self.request.META.get('HTTP_USER_AGENT', '')
        )

    def perform_destroy(self, instance):
        resident_name = f"{instance.first_name} {instance.last_name}"
        log_activity(
            user=self.request.user,
            action='delete',
            description=f'Deleted resident: {resident_name}',
            ip_address=self.request.META.get('REMOTE_ADDR'),
            user_agent=self.request.META.get('HTTP_USER_AGENT', '')
        )
        instance.delete()

class PurokListView(generics.ListAPIView):
    queryset = Purok.objects.all()
    serializer_class = PurokSerializer
    permission_classes = [permissions.IsAuthenticated]

class HouseholdListView(generics.ListAPIView):
    serializer_class = HouseholdSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        purok_id = self.kwargs.get('purok_id')
        return Household.objects.filter(purok_id=purok_id)

class MobileResidentCreateView(generics.CreateAPIView):
    serializer_class = ResidentCreateSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def perform_create(self, serializer):
        resident = serializer.save(user=self.request.user)
        log_activity(
            user=self.request.user,
            action='create',
            description=f'Created resident profile: {resident.first_name} {resident.last_name}',
            content_object=resident,
            ip_address=self.request.META.get('REMOTE_ADDR'),
            user_agent=self.request.META.get('HTTP_USER_AGENT', '')
        )

class MobileResidentDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = ResidentSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        return Resident.objects.get(user=self.request.user)
    
    def perform_update(self, serializer):
        resident = serializer.save()
        log_activity(
            user=self.request.user,
            action='update',
            description=f'Updated resident profile: {resident.first_name} {resident.last_name}',
            content_object=resident,
            ip_address=self.request.META.get('REMOTE_ADDR'),
            user_agent=self.request.META.get('HTTP_USER_AGENT', '')
        )
