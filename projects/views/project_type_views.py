from rest_framework import generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from ..models import ProjectType
from ..serializers import ProjectTypeSerializer


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def project_type_list_view(request):
    project_types = ProjectType.objects.filter(is_active=True)
    serializer = ProjectTypeSerializer(project_types, many=True)
    return Response(serializer.data)


class ProjectTypeListView(generics.ListCreateAPIView):
    queryset = ProjectType.objects.filter(is_active=True)
    serializer_class = ProjectTypeSerializer
    permission_classes = [permissions.IsAuthenticated]


class ProjectTypeDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = ProjectType.objects.all()
    serializer_class = ProjectTypeSerializer
    permission_classes = [permissions.IsAuthenticated]
