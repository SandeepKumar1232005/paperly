from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Assignment
from .serializers import AssignmentSerializer
from apps.authentication.models import User

class AssignmentViewSet(viewsets.ViewSet):
    """
    MongoDB placeholder ViewSet
    """
    def list(self, request):
        return Response([])

    def create(self, request):
        return Response({})

    def retrieve(self, request, pk=None):
        return Response({})
        
    def update(self, request, pk=None):
        return Response({})

    def destroy(self, request, pk=None):
        return Response({})
        
    @action(detail=True, methods=['post'], url_path='quote')
    def submit_quote(self, request, pk=None):
        return Response({'status': 'placeholder'})

    @action(detail=True, methods=['post'], url_path='reject')
    def reject_assignment(self, request, pk=None):
        return Response({'status': 'placeholder'})

    @action(detail=True, methods=['post'], url_path='respond-quote')
    def respond_to_quote(self, request, pk=None):
        return Response({'status': 'placeholder'})

