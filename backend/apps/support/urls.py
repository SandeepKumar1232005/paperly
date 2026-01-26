from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SupportTicketViewSet, DisputeViewSet

router = DefaultRouter()
router.register(r'tickets', SupportTicketViewSet, basename='tickets')
router.register(r'disputes', DisputeViewSet, basename='disputes')

urlpatterns = [
    path('', include(router.urls)),
]
