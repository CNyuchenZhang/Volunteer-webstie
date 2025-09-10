from rest_framework import serializers
from accounts.models import Account

class AccountSerializer(serializers.ModelSerializer):
    class Meta:
        model = Account
        fields = '__all__'

# class AccountSerializer(serializers.ModelSerializer):
#     password = serializers.CharField(write_only=True, required=True)
#
#     class Meta:
#         model = Account
#         fields = ('id', 'username', 'email', 'password', 'Character')
#         extra_kwargs = {'password': {'write_only': True}}
#
#     def create(self, validated_data):
#         password = validated_data.pop('password')
#         user = Account.objects.create_user(**validated_data)
#         user.set_password(password)
#         user.save()
#         return user
#
#
# class LoginSerializer(serializers.Serializer):
#     username = serializers.CharField()
#     password = serializers.CharField()