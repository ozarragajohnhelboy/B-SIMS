from django.db import models
from django.contrib.auth import get_user_model
from decimal import Decimal

User = get_user_model()


class IncomeCategory(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['name']
        verbose_name = "Income Category"
        verbose_name_plural = "Income Categories"
    
    def __str__(self):
        return self.name


class ExpenseCategory(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['name']
        verbose_name = "Expense Category"
        verbose_name_plural = "Expense Categories"
    
    def __str__(self):
        return self.name


class Income(models.Model):
    INCOME_TYPE_CHOICES = [
        ('barangay_clearance', 'Barangay Clearance'),
        ('indigency', 'Certificate of Indigency'),
        ('residency', 'Certificate of Residency'),
        ('good_moral', 'Good Moral Character'),
        ('other_cert', 'Other Certificate'),
        ('business_permit', 'Business Permit'),
        ('construction_permit', 'Construction Permit'),
        ('event_permit', 'Event Permit'),
        ('other_permit', 'Other Permit'),
        ('community_donation', 'Community Donation'),
        ('religious_donation', 'Religious Donation'),
        ('charity_donation', 'Charity Donation'),
        ('other_donation', 'Other Donation'),
        ('infrastructure_grant', 'Infrastructure Grant'),
        ('health_grant', 'Health Program Grant'),
        ('education_grant', 'Education Grant'),
        ('other_grant', 'Other Grant'),
        ('rental_income', 'Rental Income'),
        ('interest_income', 'Interest Income'),
        ('miscellaneous', 'Miscellaneous'),
    ]
    
    income_number = models.CharField(max_length=20, unique=True, blank=True)
    category = models.ForeignKey(IncomeCategory, on_delete=models.CASCADE, related_name='incomes')
    income_type = models.CharField(max_length=30, choices=INCOME_TYPE_CHOICES)
    description = models.TextField()
    amount = models.DecimalField(max_digits=15, decimal_places=2)
    source = models.CharField(max_length=200)
    reference_number = models.CharField(max_length=50, blank=True)
    date_received = models.DateField()
    recorded_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='recorded_incomes')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-date_received']
    
    def __str__(self):
        return f"{self.income_number} - {self.description}"
    
    def save(self, *args, **kwargs):
        if not self.income_number:
            self.income_number = f"INC{Income.objects.count() + 1:06d}"
        super().save(*args, **kwargs)


class Expense(models.Model):
    EXPENSE_TYPE_CHOICES = [
        ('infrastructure', 'Infrastructure Project'),
        ('renovation', 'Building Renovation'),
        ('equipment', 'Equipment Purchase'),
        ('other_project', 'Other Project'),
        ('official_allowance', 'Official Allowance'),
        ('travel_allowance', 'Travel Allowance'),
        ('meal_allowance', 'Meal Allowance'),
        ('other_allowance', 'Other Allowance'),
        ('electricity', 'Electricity Bill'),
        ('water', 'Water Bill'),
        ('internet', 'Internet Bill'),
        ('other_utility', 'Other Utility'),
        ('building_maintenance', 'Building Maintenance'),
        ('equipment_maintenance', 'Equipment Maintenance'),
        ('vehicle_maintenance', 'Vehicle Maintenance'),
        ('other_maintenance', 'Other Maintenance'),
        ('stationery', 'Stationery'),
        ('printing', 'Printing Materials'),
        ('cleaning', 'Cleaning Supplies'),
        ('other_supplies', 'Other Supplies'),
        ('emergency', 'Emergency Expense'),
        ('miscellaneous', 'Miscellaneous'),
    ]
    
    expense_number = models.CharField(max_length=20, unique=True, blank=True)
    category = models.ForeignKey(ExpenseCategory, on_delete=models.CASCADE, related_name='expenses')
    expense_type = models.CharField(max_length=30, choices=EXPENSE_TYPE_CHOICES)
    description = models.TextField()
    amount = models.DecimalField(max_digits=15, decimal_places=2)
    vendor = models.CharField(max_length=200, blank=True)
    reference_number = models.CharField(max_length=50, blank=True)
    date_paid = models.DateField()
    approved_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='approved_expenses')
    recorded_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='recorded_expenses')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-date_paid']
    
    def __str__(self):
        return f"{self.expense_number} - {self.description}"
    
    def save(self, *args, **kwargs):
        if not self.expense_number:
            self.expense_number = f"EXP{Expense.objects.count() + 1:06d}"
        super().save(*args, **kwargs)


class FinancialReport(models.Model):
    REPORT_TYPE_CHOICES = [
        ('monthly', 'Monthly Report'),
        ('quarterly', 'Quarterly Report'),
        ('annual', 'Annual Report'),
    ]
    
    report_number = models.CharField(max_length=20, unique=True, blank=True)
    report_type = models.CharField(max_length=20, choices=REPORT_TYPE_CHOICES)
    period_start = models.DateField()
    period_end = models.DateField()
    total_income = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal('0.00'))
    total_expense = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal('0.00'))
    net_balance = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal('0.00'))
    is_published = models.BooleanField(default=False)
    generated_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='generated_reports')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-period_end']
    
    def __str__(self):
        return f"{self.report_number} - {self.get_report_type_display()}"
    
    def save(self, *args, **kwargs):
        if not self.report_number:
            self.report_number = f"RPT{FinancialReport.objects.count() + 1:06d}"
        
        self.net_balance = self.total_income - self.total_expense
        super().save(*args, **kwargs)


class TransparencyBoard(models.Model):
    title = models.CharField(max_length=200)
    content = models.TextField()
    is_published = models.BooleanField(default=False)
    published_at = models.DateTimeField(null=True, blank=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='transparency_posts')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return self.title
    
    def save(self, *args, **kwargs):
        if self.is_published and not self.published_at:
            from django.utils import timezone
            self.published_at = timezone.now()
        super().save(*args, **kwargs)
