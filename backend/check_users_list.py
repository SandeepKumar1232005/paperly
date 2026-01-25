import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "paperly_project.settings")
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()
users = User.objects.all()

print(f"Total Users: {users.count()}")
for user in users:
    print(f"- {user.email} (ID: {user.id})")
