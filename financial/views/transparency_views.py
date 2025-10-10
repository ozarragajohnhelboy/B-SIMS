from rest_framework import generics, permissions, filters
from django_filters.rest_framework import DjangoFilterBackend
from ..models import TransparencyBoard
from ..serializers import TransparencyBoardSerializer


class TransparencyBoardListView(generics.ListCreateAPIView):
    queryset = TransparencyBoard.objects.all()
    serializer_class = TransparencyBoardSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['is_published']
    search_fields = ['title', 'content']
    ordering_fields = ['created_at', 'published_at']
    ordering = ['-created_at']
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class TransparencyBoardDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = TransparencyBoard.objects.all()
    serializer_class = TransparencyBoardSerializer
    permission_classes = [permissions.IsAuthenticated]


class PublicTransparencyBoardListView(generics.ListAPIView):
    queryset = TransparencyBoard.objects.filter(is_published=True)
    serializer_class = TransparencyBoardSerializer
    permission_classes = [permissions.AllowAny]
    ordering = ['-published_at']
