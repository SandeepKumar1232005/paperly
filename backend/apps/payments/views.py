import stripe
import os
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.http import HttpResponse
from .models import Transaction
from apps.assignments.models import Assignment

stripe.api_key = os.environ.get('STRIPE_SECRET_KEY')

class CreatePaymentIntentView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        return Response({'clientSecret': 'mock_secret_for_migration'})

@method_decorator(csrf_exempt, name='dispatch')
class StripeWebhookView(APIView):
    permission_classes = [] 

    def post(self, request):
        return HttpResponse(status=200)
