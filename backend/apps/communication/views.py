from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import Message, Announcement
from .serializers import MessageSerializer, AnnouncementSerializer
from django.db.models import Q

class MessageViewSet(viewsets.ViewSet):
    def list(self, request): return Response([])
    def create(self, request): return Response({})
    def retrieve(self, request, pk=None): return Response({})
    def update(self, request, pk=None): return Response({})
    def destroy(self, request, pk=None): return Response({})

class AnnouncementViewSet(viewsets.ViewSet):
    def list(self, request): return Response([])
    def create(self, request): return Response({})
    def retrieve(self, request, pk=None): return Response({})
    def update(self, request, pk=None): return Response({})
    def destroy(self, request, pk=None): return Response({})
