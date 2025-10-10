from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from core.models import ActivityLog
from core.utils import log_activity
from datetime import datetime, timedelta
import random

User = get_user_model()


class Command(BaseCommand):
    help = 'Populate sample activity logs for testing'

    def handle(self, *args, **options):
        users = User.objects.all()
        if not users.exists():
            self.stdout.write(self.style.WARNING('No users found. Please create users first.'))
            return

        activities = [
            ('create', 'Created new resident: Juan Dela Cruz'),
            ('create', 'Created new resident: Maria Santos'),
            ('update', 'Updated resident information: Pedro Reyes'),
            ('create', 'Created new household: HH-001'),
            ('create', 'Created new document request: Barangay Clearance'),
            ('update', 'Updated document request status: Approved'),
            ('create', 'Created new blotter entry: Noise Complaint'),
            ('create', 'Added new income record: ₱5,000.00'),
            ('create', 'Added new expense record: ₱2,500.00'),
            ('create', 'Created new project: Road Repair'),
            ('update', 'Updated project progress: 75% complete'),
            ('create', 'Published new announcement: Health Advisory'),
            ('export', 'Exported residents data to CSV'),
            ('export', 'Exported financial records to CSV'),
            ('login', 'User logged in successfully'),
            ('view', 'Viewed dashboard statistics'),
            ('view', 'Viewed financial reports'),
            ('view', 'Viewed project progress'),
        ]

        base_time = datetime.now()
        
        for i, (action, description) in enumerate(activities):
            user = random.choice(users)
            timestamp = base_time - timedelta(hours=i, minutes=random.randint(0, 59))
            
            ActivityLog.objects.create(
                user=user,
                action=action,
                description=description,
                timestamp=timestamp,
                ip_address=f'192.168.1.{random.randint(1, 255)}',
                user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            )

        self.stdout.write(
            self.style.SUCCESS(f'Successfully created {len(activities)} sample activity logs')
        )
