from rest_framework import serializers
from .models import ProjectType, Project, ProjectPhoto, ProjectReceipt, ProjectMilestone, CommunityEvent


class ProjectTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectType
        fields = '__all__'


class ProjectSerializer(serializers.ModelSerializer):
    project_type_name = serializers.CharField(source='project_type.name', read_only=True)
    project_type_color = serializers.CharField(source='project_type.color', read_only=True)
    project_manager_name = serializers.CharField(source='project_manager.get_full_name', read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    budget_remaining = serializers.ReadOnlyField()
    is_overdue = serializers.ReadOnlyField()
    days_remaining = serializers.ReadOnlyField()
    
    class Meta:
        model = Project
        fields = '__all__'


class ProjectCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = [
            'title', 'description', 'project_type', 'status', 'priority',
            'budget_allocated', 'start_date', 'end_date', 'location', 'is_public'
        ]
    
    def validate_project_type(self, value):
        if not value:
            raise serializers.ValidationError("Project type is required.")
        return value
    
    def create(self, validated_data):
        project = Project.objects.create(**validated_data)
        return project


class ProjectPhotoSerializer(serializers.ModelSerializer):
    uploaded_by_name = serializers.CharField(source='uploaded_by.get_full_name', read_only=True)
    
    class Meta:
        model = ProjectPhoto
        fields = '__all__'


class ProjectReceiptSerializer(serializers.ModelSerializer):
    uploaded_by_name = serializers.CharField(source='uploaded_by.get_full_name', read_only=True)
    
    class Meta:
        model = ProjectReceipt
        fields = '__all__'


class ProjectMilestoneSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectMilestone
        fields = '__all__'


class CommunityEventSerializer(serializers.ModelSerializer):
    organizer_name = serializers.CharField(source='organizer.get_full_name', read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    is_upcoming = serializers.ReadOnlyField()
    is_ongoing = serializers.ReadOnlyField()
    is_past = serializers.ReadOnlyField()
    
    class Meta:
        model = CommunityEvent
        fields = '__all__'


class CommunityEventCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = CommunityEvent
        fields = '__all__'
        extra_kwargs = {
            'organizer': { 'required': False },
            'created_by': { 'required': False },
        }

    def validate(self, attrs):
        start = attrs.get('start_datetime')
        end = attrs.get('end_datetime')
        if start and end and end < start:
            raise serializers.ValidationError('end_datetime must be after start_datetime')
        return attrs
