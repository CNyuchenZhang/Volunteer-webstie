import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from accounts.models import Account

try:
    user = Account.objects.get(username='admin')
    user.set_password('Admin123!')
    user.save()
    print('Admin password set successfully to: Admin123!')
except Account.DoesNotExist:
    print('Admin user not found') 