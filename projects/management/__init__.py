from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from projects.models import ProjectType, Project, ProjectMilestone, CommunityEvent
from datetime import date, datetime, timedelta
from decimal import Decimal

User = get_user_model()


class Command(BaseCommand):
    help = 'Populate sample project and event data'

    def handle(self, *args, **options):
        self.stdout.write('Creating project types...')
        
        project_types = [
            {'name': 'Infrastructure', 'description': 'Roads, bridges, buildings, and public facilities', 'color': '#3B82F6'},
            {'name': 'Livelihood', 'description': 'Income-generating projects and skills training', 'color': '#10B981'},
            {'name': 'Health', 'description': 'Health programs, medical facilities, and wellness initiatives', 'color': '#EF4444'},
            {'name': 'Education', 'description': 'Educational facilities and learning programs', 'color': '#8B5CF6'},
            {'name': 'Environment', 'description': 'Environmental protection and sustainability projects', 'color': '#059669'},
        ]
        
        for pt_data in project_types:
            project_type, created = ProjectType.objects.get_or_create(
                name=pt_data['name'],
                defaults=pt_data
            )
            if created:
                self.stdout.write(f'Created project type: {project_type.name}')
        
        admin_user = User.objects.filter(is_superuser=True).first()
        if not admin_user:
            self.stdout.write('No admin user found. Please create an admin user first.')
            return
        
        self.stdout.write('Creating sample projects...')
        
        projects_data = [
            {
                'title': 'Barangay Health Center Renovation',
                'description': 'Complete renovation of the barangay health center including new equipment and facilities',
                'project_type': 'Health',
                'status': 'ongoing',
                'priority': 'high',
                'budget_allocated': Decimal('500000.00'),
                'budget_spent': Decimal('150000.00'),
                'progress_percentage': 30,
                'start_date': date.today() - timedelta(days=30),
                'end_date': date.today() + timedelta(days=60),
                'location': 'Barangay Health Center, Main Street',
            },
            {
                'title': 'Livelihood Training Center',
                'description': 'Construction of a multi-purpose training center for livelihood programs',
                'project_type': 'Livelihood',
                'status': 'planning',
                'priority': 'medium',
                'budget_allocated': Decimal('800000.00'),
                'budget_spent': Decimal('0.00'),
                'progress_percentage': 0,
                'start_date': date.today() + timedelta(days=15),
                'end_date': date.today() + timedelta(days=120),
                'location': 'Barangay Hall Compound',
            },
            {
                'title': 'Road Improvement Project',
                'description': 'Asphalt overlay and drainage improvement for main barangay roads',
                'project_type': 'Infrastructure',
                'status': 'completed',
                'priority': 'high',
                'budget_allocated': Decimal('1200000.00'),
                'budget_spent': Decimal('1200000.00'),
                'progress_percentage': 100,
                'start_date': date.today() - timedelta(days=90),
                'end_date': date.today() - timedelta(days=10),
                'location': 'Main Barangay Roads',
            },
            {
                'title': 'Environmental Protection Program',
                'description': 'Tree planting and waste management system implementation',
                'project_type': 'Environment',
                'status': 'ongoing',
                'priority': 'medium',
                'budget_allocated': Decimal('300000.00'),
                'budget_spent': Decimal('75000.00'),
                'progress_percentage': 25,
                'start_date': date.today() - timedelta(days=15),
                'end_date': date.today() + timedelta(days=45),
                'location': 'Various locations in barangay',
            },
        ]
        
        for project_data in projects_data:
            project_type = ProjectType.objects.get(name=project_data['project_type'])
            project_data['project_type'] = project_type
            
            project, created = Project.objects.get_or_create(
                title=project_data['title'],
                defaults={
                    **project_data,
                    'project_manager': admin_user,
                    'created_by': admin_user,
                }
            )
            if created:
                self.stdout.write(f'Created project: {project.title}')
                
                milestones_data = [
                    {'title': 'Project Planning', 'description': 'Initial planning and design phase', 'target_date': project.start_date + timedelta(days=7)},
                    {'title': 'Implementation Start', 'description': 'Begin actual implementation', 'target_date': project.start_date + timedelta(days=14)},
                    {'title': 'Mid-point Review', 'description': 'Progress review and adjustments', 'target_date': project.start_date + timedelta(days=project.end_date.day - project.start_date.day) // 2},
                    {'title': 'Project Completion', 'description': 'Final completion and handover', 'target_date': project.end_date},
                ]
                
                for milestone_data in milestones_data:
                    milestone, created = ProjectMilestone.objects.get_or_create(
                        project=project,
                        title=milestone_data['title'],
                        defaults=milestone_data
                    )
                    if created:
                        self.stdout.write(f'Created milestone: {milestone.title}')
        
        self.stdout.write('Creating sample community events...')
        
        events_data = [
            {
                'title': 'Barangay Assembly Meeting',
                'description': 'Monthly barangay assembly to discuss community issues and updates',
                'event_type': 'meeting',
                'start_datetime': datetime.now() + timedelta(days=7, hours=18),
                'end_datetime': datetime.now() + timedelta(days=7, hours=20),
                'location': 'Barangay Hall',
                'budget_allocated': Decimal('5000.00'),
            },
            {
                'title': 'Health Awareness Seminar',
                'description': 'Free health check-up and awareness seminar for residents',
                'event_type': 'health',
                'start_datetime': datetime.now() + timedelta(days=14, hours=8),
                'end_datetime': datetime.now() + timedelta(days=14, hours=16),
                'location': 'Barangay Health Center',
                'budget_allocated': Decimal('15000.00'),
            },
            {
                'title': 'Livelihood Skills Training',
                'description': 'Free skills training for residents on various livelihood opportunities',
                'event_type': 'training',
                'start_datetime': datetime.now() + timedelta(days=21, hours=9),
                'end_datetime': datetime.now() + timedelta(days=21, hours=17),
                'location': 'Barangay Training Center',
                'budget_allocated': Decimal('25000.00'),
            },
            {
                'title': 'Barangay Fiesta Celebration',
                'description': 'Annual barangay fiesta celebration with cultural shows and food stalls',
                'event_type': 'festival',
                'start_datetime': datetime.now() + timedelta(days=30, hours=8),
                'end_datetime': datetime.now() + timedelta(days=30, hours=22),
                'location': 'Barangay Plaza',
                'budget_allocated': Decimal('50000.00'),
            },
        ]
        
        for event_data in events_data:
            event, created = CommunityEvent.objects.get_or_create(
                title=event_data['title'],
                defaults={
                    **event_data,
                    'organizer': admin_user,
                    'created_by': admin_user,
                }
            )
            if created:
                self.stdout.write(f'Created event: {event.title}')
        
        self.stdout.write(self.style.SUCCESS('Successfully populated sample project and event data!'))
