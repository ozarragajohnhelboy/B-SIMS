from rest_framework import serializers
from .models import Purok, Household, Resident, DocumentType, DocumentRequest, Blotter


class PurokSerializer(serializers.ModelSerializer):
    class Meta:
        model = Purok
        fields = '__all__'
        read_only_fields = ['created_at']


class HouseholdSerializer(serializers.ModelSerializer):
    purok_name = serializers.CharField(source='purok.name', read_only=True)
    
    class Meta:
        model = Household
        fields = '__all__'
        read_only_fields = ['household_number', 'created_at', 'updated_at']


class ResidentSerializer(serializers.ModelSerializer):
    full_name = serializers.ReadOnlyField()
    age = serializers.ReadOnlyField()
    household_number = serializers.CharField(source='household.household_number', read_only=True)
    purok_name = serializers.CharField(source='household.purok.name', read_only=True)
    
    class Meta:
        model = Resident
        fields = '__all__'
        read_only_fields = ['barangay_id', 'qr_code', 'created_at', 'updated_at']


class ResidentCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Resident
        exclude = ['barangay_id', 'qr_code', 'created_at', 'updated_at']
    
    def create(self, validated_data):
        return Resident.objects.create(**validated_data)


class DocumentTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = DocumentType
        fields = '__all__'
        read_only_fields = ['created_at']


class DocumentRequestSerializer(serializers.ModelSerializer):
    resident_name = serializers.CharField(source='resident.full_name', read_only=True)
    document_type_name = serializers.CharField(source='document_type.name', read_only=True)
    document_type_fee = serializers.DecimalField(source='document_type.required_fee', max_digits=10, decimal_places=2, read_only=True)
    requested_by_name = serializers.CharField(source='requested_by.get_full_name', read_only=True)
    approved_by_name = serializers.CharField(source='approved_by.get_full_name', read_only=True)
    
    class Meta:
        model = DocumentRequest
        fields = '__all__'
        read_only_fields = ['request_number', 'created_at', 'updated_at']


class DocumentRequestCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = DocumentRequest
        exclude = ['request_number', 'created_at', 'updated_at']
        extra_kwargs = {
            'resident': {'required': False},
            'requested_by': {'required': False},
            'approved_by': {'required': False}
        }


class BlotterSerializer(serializers.ModelSerializer):
    recorded_by_name = serializers.CharField(source='recorded_by.get_full_name', read_only=True)
    
    class Meta:
        model = Blotter
        fields = '__all__'
        read_only_fields = ['blotter_number', 'created_at', 'updated_at']


class BlotterCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Blotter
        exclude = ['blotter_number', 'created_at', 'updated_at']
        extra_kwargs = {
            'recorded_by': {'required': False}
        }
