from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import SystemSettings
from .serializers import SystemSettingsSerializer

class SystemSettingsViewSet(viewsets.ViewSet):
    def list(self, request, *args, **kwargs):
        return Response({})

    def create(self, request, *args, **kwargs):
        return Response(status=status.HTTP_405_METHOD_NOT_ALLOWED)
