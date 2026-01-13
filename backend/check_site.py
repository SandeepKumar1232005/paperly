import os
import django
from django.conf import settings

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'paperly_project.settings')
django.setup()

from django.contrib.sites.models import Site

try:
    site = Site.objects.get(id=1)
    print(f"Site ID 1 exists: {site.domain} - {site.name}")
except Site.DoesNotExist:
    print("Site ID 1 DOES NOT EXIST. Creating it...")
    Site.objects.create(id=1, domain='localhost', name='localhost')
    print("Site ID 1 created.")
except Exception as e:
    print(f"Error checking Site: {e}")
