from rest_framework import serializers
from .models import Configuration

class ConfigurationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Configuration
        fields = ['id', 'key', 'value', 'description', 'created_at', 'updated_at']

class ConfigurationCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Configuration
        fields = ['key', 'value', 'description']
