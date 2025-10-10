from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta
from announcements.models import AnnouncementCategory, Announcement, NotificationTemplate

User = get_user_model()


class Command(BaseCommand):
    help = 'Populate announcement data'

    def handle(self, *args, **options):
        self.stdout.write('Creating announcement categories...')
        
        categories_data = [
            {'name': 'Health', 'description': 'Health-related announcements and advisories', 'color': '#10B981'},
            {'name': 'Safety', 'description': 'Safety alerts and security notices', 'color': '#EF4444'},
            {'name': 'Events', 'description': 'Community events and activities', 'color': '#3B82F6'},
            {'name': 'Infrastructure', 'description': 'Road repairs, utilities, and infrastructure updates', 'color': '#F59E0B'},
            {'name': 'Government', 'description': 'Official government announcements and policies', 'color': '#8B5CF6'},
            {'name': 'Education', 'description': 'Educational programs and school-related announcements', 'color': '#06B6D4'},
            {'name': 'Environment', 'description': 'Environmental programs and conservation efforts', 'color': '#84CC16'},
            {'name': 'Social Services', 'description': 'Social welfare programs and assistance', 'color': '#F97316'},
        ]
        
        categories = []
        for cat_data in categories_data:
            category, created = AnnouncementCategory.objects.get_or_create(
                name=cat_data['name'],
                defaults=cat_data
            )
            categories.append(category)
            if created:
                self.stdout.write(f'Created category: {category.name}')

        admin_user = User.objects.filter(is_superuser=True).first()
        if not admin_user:
            admin_user = User.objects.create_superuser('admin', 'admin@example.com', 'admin123')

        self.stdout.write('Creating announcements...')
        
        announcements_data = [
            {
                'title': 'COVID-19 Vaccination Drive',
                'content': 'Free COVID-19 vaccination will be available at the barangay hall every Saturday from 8:00 AM to 4:00 PM. All residents aged 18 and above are encouraged to participate.',
                'category': categories[0],
                'priority': 'high',
                'status': 'published',
                'is_featured': True,
                'is_pinned': True,
                'publish_date': timezone.now() - timedelta(days=2)
            },
            {
                'title': 'Road Closure Notice',
                'content': 'Main Street will be closed for road repair from January 15-20, 2024. Please use alternative routes during this period.',
                'category': categories[3],
                'priority': 'urgent',
                'status': 'published',
                'is_pinned': True,
                'publish_date': timezone.now() - timedelta(days=1)
            },
            {
                'title': 'Community Clean-up Drive',
                'content': 'Join us for our monthly community clean-up drive on January 25, 2024 at 6:00 AM. Meet at the barangay hall.',
                'category': categories[6],
                'priority': 'medium',
                'status': 'published',
                'is_featured': True,
                'publish_date': timezone.now() - timedelta(hours=12)
            },
            {
                'title': 'Barangay Assembly Meeting',
                'content': 'Monthly barangay assembly meeting will be held on January 30, 2024 at 7:00 PM in the barangay hall.',
                'category': categories[4],
                'priority': 'medium',
                'status': 'published',
                'publish_date': timezone.now() - timedelta(hours=6)
            },
            {
                'title': 'Scholarship Program Application',
                'content': 'Applications for the barangay scholarship program are now open. Deadline is February 15, 2024.',
                'category': categories[5],
                'priority': 'high',
                'status': 'published',
                'publish_date': timezone.now() - timedelta(hours=3)
            },
            {
                'title': 'Fire Safety Seminar',
                'content': 'Free fire safety seminar will be conducted on February 10, 2024 at 2:00 PM. Registration is required.',
                'category': categories[1],
                'priority': 'medium',
                'status': 'published',
                'publish_date': timezone.now() - timedelta(hours=1)
            },
            {
                'title': 'Senior Citizen Benefits',
                'content': 'Senior citizens can now claim their monthly benefits at the barangay hall every first Monday of the month.',
                'category': categories[7],
                'priority': 'medium',
                'status': 'published',
                'publish_date': timezone.now()
            },
            {
                'title': 'Youth Sports Tournament',
                'content': 'Annual youth sports tournament will be held on March 15-20, 2024. Registration starts February 1.',
                'category': categories[2],
                'priority': 'low',
                'status': 'published',
                'publish_date': timezone.now() + timedelta(hours=2)
            },
            {
                'title': 'Water Interruption Notice',
                'content': 'Water service will be interrupted on January 22, 2024 from 8:00 AM to 4:00 PM for maintenance work.',
                'category': categories[3],
                'priority': 'high',
                'status': 'published',
                'publish_date': timezone.now() + timedelta(hours=4)
            },
            {
                'title': 'Health Check-up Program',
                'content': 'Free health check-up for all residents will be available every Wednesday from 9:00 AM to 3:00 PM.',
                'category': categories[0],
                'priority': 'medium',
                'status': 'published',
                'publish_date': timezone.now() + timedelta(hours=6)
            },
            {
                'title': 'Draft: New Barangay Ordinance',
                'content': 'A new ordinance regarding waste management is being drafted and will be presented in the next assembly.',
                'category': categories[4],
                'priority': 'low',
                'status': 'draft',
                'publish_date': None
            },
            {
                'title': 'Draft: Community Garden Project',
                'content': 'Plans for a community garden project are being developed. More details will be announced soon.',
                'category': categories[6],
                'priority': 'low',
                'status': 'draft',
                'publish_date': None
            }
        ]
        
        for announcement_data in announcements_data:
            announcement, created = Announcement.objects.get_or_create(
                title=announcement_data['title'],
                defaults={
                    **announcement_data,
                    'created_by': admin_user,
                    'views_count': 0
                }
            )
            if created:
                self.stdout.write(f'Created announcement: {announcement.title}')

        self.stdout.write('Creating notification templates...')
        
        templates_data = [
            {
                'name': 'Emergency Alert',
                'subject': 'URGENT: {title}',
                'message': 'URGENT ANNOUNCEMENT: {content}\n\nPlease take immediate action if required.\n\n- Barangay Administration',
                'category': categories[1],
                'is_active': True
            },
            {
                'name': 'Event Reminder',
                'subject': 'Reminder: {title}',
                'message': 'This is a reminder about: {title}\n\n{content}\n\nWe look forward to your participation.\n\n- Barangay Administration',
                'category': categories[2],
                'is_active': True
            },
            {
                'name': 'Health Advisory',
                'subject': 'Health Advisory: {title}',
                'message': 'HEALTH ADVISORY\n\n{content}\n\nPlease follow the guidelines for your safety and the safety of others.\n\n- Barangay Health Office',
                'category': categories[0],
                'is_active': True
            }
        ]
        
        for template_data in templates_data:
            template, created = NotificationTemplate.objects.get_or_create(
                name=template_data['name'],
                defaults=template_data
            )
            if created:
                self.stdout.write(f'Created template: {template.name}')

        self.stdout.write(
            self.style.SUCCESS('Successfully populated announcement data!')
        )
