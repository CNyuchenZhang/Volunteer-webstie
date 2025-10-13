#!/usr/bin/env python
"""
Create test data for activity service.
"""
import os
import sys
import django
from datetime import timedelta

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'activity_service.settings')
django.setup()

from activities.models import ActivityCategory, Activity
from django.utils import timezone

def create_test_data():
    # 创建活动分类
    categories = [
        {'name': 'Environment', 'description': 'Environmental protection activities'},
        {'name': 'Education', 'description': 'Educational support activities'},
        {'name': 'Social', 'description': 'Social welfare activities'},
        {'name': 'Animal Welfare', 'description': 'Animal care and protection activities'},
    ]

    for cat_data in categories:
        cat, created = ActivityCategory.objects.get_or_create(
            name=cat_data['name'],
            defaults={'description': cat_data['description']}
        )
        print(f'Category {cat.name}: {"created" if created else "already exists"}')

    # 创建一些测试活动
    activities = [
        {
            'title': 'Beach Cleanup',
            'description': 'Help clean up the local beach',
            'category_name': 'Environment',
            'location': 'Sunset Beach',
            'start_date': timezone.now() + timedelta(days=7),
            'end_date': timezone.now() + timedelta(days=7, hours=4),
            'max_participants': 50,
            'organizer_id': 1,
            'organizer_name': 'Eco Group',
            'organizer_email': 'eco@example.com',
            'status': 'approved',
            'approval_status': 'approved'
        },
        {
            'title': 'Tutoring Program',
            'description': 'Help students with homework',
            'category_name': 'Education',
            'location': 'Community Center',
            'start_date': timezone.now() + timedelta(days=14),
            'end_date': timezone.now() + timedelta(days=14, hours=2),
            'max_participants': 20,
            'organizer_id': 2,
            'organizer_name': 'Education Foundation',
            'organizer_email': 'edu@example.com',
            'status': 'approved',
            'approval_status': 'approved'
        }
    ]

    for act_data in activities:
        category = ActivityCategory.objects.get(name=act_data['category_name'])
        activity, created = Activity.objects.get_or_create(
            title=act_data['title'],
            defaults={
                'description': act_data['description'],
                'category': category,
                'location': act_data['location'],
                'start_date': act_data['start_date'],
                'end_date': act_data['end_date'],
                'max_participants': act_data['max_participants'],
                'organizer_id': act_data['organizer_id'],
                'organizer_name': act_data['organizer_name'],
                'organizer_email': act_data['organizer_email'],
                'status': act_data['status'],
                'approval_status': act_data['approval_status']
            }
        )
        print(f'Activity {activity.title}: {"created" if created else "already exists"}')

if __name__ == '__main__':
    create_test_data()
