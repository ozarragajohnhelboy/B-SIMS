from django.core.management.base import BaseCommand
from residents.models import Purok, Household, Resident, DocumentType
from accounts.models import User
from datetime import date, timedelta
import random


class Command(BaseCommand):
    help = 'Populate database with sample data'

    def handle(self, *args, **options):
        self.stdout.write('Creating sample data...')
        
        puroks_data = [
            {'name': 'Purok 1', 'description': 'Central area'},
            {'name': 'Purok 2', 'description': 'North side'},
            {'name': 'Purok 3', 'description': 'South side'},
            {'name': 'Purok 4', 'description': 'East side'},
            {'name': 'Purok 5', 'description': 'West side'},
        ]
        
        puroks = []
        for purok_data in puroks_data:
            purok, created = Purok.objects.get_or_create(
                name=purok_data['name'],
                defaults=purok_data
            )
            puroks.append(purok)
        
        households = []
        for purok in puroks:
            for i in range(1, 6):
                household, created = Household.objects.get_or_create(
                    purok=purok,
                    defaults={
                        'address': f'{purok.name} Street {i}',
                        'contact_number': f'09{random.randint(100000000, 999999999)}'
                    }
                )
                households.append(household)
        
        document_types_data = [
            {'name': 'Barangay Clearance', 'description': 'For employment, business, etc.', 'required_fee': 50.00, 'validity_days': 30},
            {'name': 'Certificate of Indigency', 'description': 'For government assistance', 'required_fee': 25.00, 'validity_days': 60},
            {'name': 'Certificate of Residency', 'description': 'Proof of residence', 'required_fee': 30.00, 'validity_days': 90},
            {'name': 'Business Permit', 'description': 'For business operations', 'required_fee': 100.00, 'validity_days': 365},
        ]
        
        document_types = []
        for doc_type_data in document_types_data:
            doc_type, created = DocumentType.objects.get_or_create(
                name=doc_type_data['name'],
                defaults=doc_type_data
            )
            document_types.append(doc_type)
        
        first_names = ['Juan', 'Maria', 'Jose', 'Ana', 'Pedro', 'Carmen', 'Miguel', 'Elena', 'Carlos', 'Rosa']
        last_names = ['Santos', 'Garcia', 'Rodriguez', 'Lopez', 'Martinez', 'Gonzalez', 'Perez', 'Sanchez', 'Ramirez', 'Cruz']
        
        for i, household in enumerate(households[:20]):
            first_name = random.choice(first_names)
            last_name = random.choice(last_names)
            
            resident, created = Resident.objects.get_or_create(
                first_name=first_name,
                last_name=last_name,
                defaults={
                    'birth_date': date.today() - timedelta(days=random.randint(18*365, 65*365)),
                    'gender': random.choice(['male', 'female']),
                    'marital_status': random.choice(['single', 'married', 'widowed']),
                    'occupation': random.choice(['Farmer', 'Teacher', 'Driver', 'Vendor', 'Retired', 'Student']),
                    'monthly_income': random.randint(5000, 50000),
                    'household': household,
                    'relationship_to_head': 'head' if i % 3 == 0 else random.choice(['spouse', 'child', 'parent']),
                    'emergency_contact_name': f'Emergency Contact {i}',
                    'emergency_contact_number': f'09{random.randint(100000000, 999999999)}',
                    'is_voter': random.choice([True, False]),
                    'is_pwd': random.choice([True, False]),
                    'is_senior_citizen': random.choice([True, False]),
                }
            )
        
        self.stdout.write(
            self.style.SUCCESS('Successfully created sample data!')
        )
