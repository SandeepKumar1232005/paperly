from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    # Custom Auth (PyMongo)
    path('api/auth/', include('apps.authentication.urls')),
    
    # Application routes
    path('api/users/', include('apps.authentication.urls')), # Revisit if we need list users, currently auth urls cover login/reg
    path('api/communication/', include('apps.communication.urls')),
    path('api/payments/', include('apps.payments.urls')),
    path('api/assignments/', include('apps.assignments.urls')),
    path('api/support/', include('apps.support.urls')),
    path('api/core/', include('apps.core.urls')),
    path('api/analytics/', include('apps.analytics.urls')),
    path('api/reviews/', include('apps.reviews.urls')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
