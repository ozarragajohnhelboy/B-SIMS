from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from financial.models import IncomeCategory, ExpenseCategory, Income, Expense, TransparencyBoard
from decimal import Decimal
from datetime import datetime, timedelta
import random

User = get_user_model()


class Command(BaseCommand):
    help = 'Populate financial data for testing'

    def handle(self, *args, **options):
        self.stdout.write('Creating financial data...')
        
        admin_user = User.objects.filter(role='admin').first()
        if not admin_user:
            admin_user = User.objects.create_user(
                username='admin',
                email='admin@barangay.com',
                password='admin123',
                role='admin',
                first_name='Barangay',
                last_name='Administrator'
            )
        
        income_categories = [
            {'name': 'Certificate Fees', 'description': 'Fees from barangay certificates'},
            {'name': 'Permit Fees', 'description': 'Fees from business permits'},
            {'name': 'Donations', 'description': 'Donations from residents and organizations'},
            {'name': 'Government Grants', 'description': 'Grants from national government'},
            {'name': 'Other Income', 'description': 'Miscellaneous income sources'},
        ]
        
        expense_categories = [
            {'name': 'Project Expenses', 'description': 'Expenses for barangay projects'},
            {'name': 'Allowances', 'description': 'Allowances for barangay officials'},
            {'name': 'Utilities', 'description': 'Electricity, water, and other utilities'},
            {'name': 'Maintenance', 'description': 'Maintenance of barangay facilities'},
            {'name': 'Office Supplies', 'description': 'Office supplies and equipment'},
            {'name': 'Other Expenses', 'description': 'Miscellaneous expenses'},
        ]
        
        for cat_data in income_categories:
            IncomeCategory.objects.get_or_create(
                name=cat_data['name'],
                defaults={'description': cat_data['description']}
            )
        
        for cat_data in expense_categories:
            ExpenseCategory.objects.get_or_create(
                name=cat_data['name'],
                defaults={'description': cat_data['description']}
            )
        
        income_cats = IncomeCategory.objects.all()
        expense_cats = ExpenseCategory.objects.all()
        
        income_types = ['certificate', 'permit', 'donation', 'grant', 'other']
        expense_types = ['project', 'allowance', 'utility', 'maintenance', 'supplies', 'other']
        
        for i in range(50):
            date_received = datetime.now() - timedelta(days=random.randint(1, 365))
            Income.objects.get_or_create(
                income_number=f'INC{i+1:06d}',
                defaults={
                    'category': random.choice(income_cats),
                    'income_type': random.choice(income_types),
                    'description': f'Sample income entry {i+1}',
                    'amount': Decimal(str(random.uniform(100, 10000))),
                    'source': f'Source {i+1}',
                    'reference_number': f'REF{i+1:06d}',
                    'date_received': date_received.date(),
                    'recorded_by': admin_user
                }
            )
        
        for i in range(30):
            date_paid = datetime.now() - timedelta(days=random.randint(1, 365))
            Expense.objects.get_or_create(
                expense_number=f'EXP{i+1:06d}',
                defaults={
                    'category': random.choice(expense_cats),
                    'expense_type': random.choice(expense_types),
                    'description': f'Sample expense entry {i+1}',
                    'amount': Decimal(str(random.uniform(200, 8000))),
                    'vendor': f'Vendor {i+1}',
                    'reference_number': f'INV{i+1:06d}',
                    'date_paid': date_paid.date(),
                    'approved_by': admin_user,
                    'recorded_by': admin_user
                }
            )
        
        transparency_posts = [
            {
                'title': 'Monthly Financial Report - October 2024',
                'content': 'This month, the barangay collected ₱45,000 in various fees and spent ₱38,000 on projects and operations. Net balance: ₱7,000.',
                'is_published': True
            },
            {
                'title': 'Infrastructure Project Update',
                'content': 'The barangay hall renovation project is 75% complete. Total budget allocated: ₱150,000. Amount spent so far: ₱112,500.',
                'is_published': True
            },
            {
                'title': 'Community Development Programs',
                'content': 'Various community programs were implemented this quarter including health services, education support, and livelihood training.',
                'is_published': True
            },
            {
                'title': 'Budget Allocation for Next Quarter',
                'content': 'The barangay council has approved the budget allocation for Q1 2025. Priority areas include infrastructure, health services, and education.',
                'is_published': False
            }
        ]
        
        for post_data in transparency_posts:
            TransparencyBoard.objects.get_or_create(
                title=post_data['title'],
                defaults={
                    'content': post_data['content'],
                    'is_published': post_data['is_published'],
                    'created_by': admin_user
                }
            )
        
        self.stdout.write(
            self.style.SUCCESS('Successfully created financial data!')
        )
