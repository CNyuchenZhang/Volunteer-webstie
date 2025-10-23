"""
Custom authentication for activity service.
"""
import requests
from rest_framework.authentication import TokenAuthentication
from rest_framework.exceptions import AuthenticationFailed
from django.conf import settings


class UserServiceTokenAuthentication(TokenAuthentication):
    """
    Custom token authentication that validates tokens with user service.
    """
    
    def authenticate_credentials(self, key):
        """
        Validate token with user service.
        """
        try:
            # Call user service to validate token
            response = requests.get(
                f"{settings.USER_SERVICE_URL}/api/v1/users/profile/",
                headers={'Authorization': f'Token {key}'},
                timeout=5
            )
            
            if response.status_code == 200:
                user_data = response.json()
                # Create a mock user object with the data from user service
                user = MockUser(user_data)
                return (user, key)
            else:
                raise AuthenticationFailed('Invalid token')
                
        except requests.exceptions.RequestException:
            raise AuthenticationFailed('Unable to validate token with user service')


class MockUser:
    """
    Mock user object for cross-service authentication.
    """
    
    def __init__(self, user_data):
        self.id = user_data.get('id')
        self.username = user_data.get('username')
        self.email = user_data.get('email')
        self.first_name = user_data.get('first_name', '')
        self.last_name = user_data.get('last_name', '')
        self.role = user_data.get('role')
        self.phone = user_data.get('phone', '')
        self.is_authenticated = True
        self.is_anonymous = False
    
    def __str__(self):
        return self.username
    
    def has_perm(self, perm, obj=None):
        return False
    
    def has_module_perms(self, app_label):
        return False
