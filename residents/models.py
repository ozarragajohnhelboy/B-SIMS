from django.db import models
from django.contrib.auth import get_user_model
import uuid
import qrcode
from io import BytesIO
from django.core.files.base import ContentFile

User = get_user_model()


class Purok(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['name']
    
    def __str__(self):
        return self.name


class Household(models.Model):
    household_number = models.CharField(max_length=20, unique=True)
    purok = models.ForeignKey(Purok, on_delete=models.CASCADE, related_name='households')
    address = models.TextField()
    contact_number = models.CharField(max_length=15, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['household_number']
    
    def __str__(self):
        return f"Household {self.household_number} - {self.purok.name}"
    
    def save(self, *args, **kwargs):
        if not self.household_number:
            self.household_number = f"HH{self.purok.id:03d}{Household.objects.filter(purok=self.purok).count() + 1:04d}"
        super().save(*args, **kwargs)


class Resident(models.Model):
    GENDER_CHOICES = [
        ('male', 'Male'),
        ('female', 'Female'),
        ('other', 'Other'),
    ]
    
    MARITAL_STATUS_CHOICES = [
        ('single', 'Single'),
        ('married', 'Married'),
        ('widowed', 'Widowed'),
        ('divorced', 'Divorced'),
    ]
    
    RELATIONSHIP_CHOICES = [
        ('head', 'Head of Family'),
        ('spouse', 'Spouse'),
        ('child', 'Child'),
        ('parent', 'Parent'),
        ('sibling', 'Sibling'),
        ('other', 'Other'),
    ]
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='resident_profile', null=True, blank=True)
    barangay_id = models.CharField(max_length=20, unique=True, blank=True)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    middle_name = models.CharField(max_length=100, blank=True)
    suffix = models.CharField(max_length=10, blank=True)
    birth_date = models.DateField()
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES)
    marital_status = models.CharField(max_length=20, choices=MARITAL_STATUS_CHOICES)
    occupation = models.CharField(max_length=100, blank=True)
    monthly_income = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    household = models.ForeignKey(Household, on_delete=models.CASCADE, related_name='residents', null=True, blank=True)
    relationship_to_head = models.CharField(max_length=20, choices=RELATIONSHIP_CHOICES, default='head')
    emergency_contact_name = models.CharField(max_length=100, blank=True)
    emergency_contact_number = models.CharField(max_length=15, blank=True)
    is_voter = models.BooleanField(default=False)
    is_pwd = models.BooleanField(default=False)
    is_senior_citizen = models.BooleanField(default=False)
    qr_code = models.ImageField(upload_to='qr_codes/', blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['last_name', 'first_name']
    
    def __str__(self):
        return f"{self.first_name} {self.last_name}"
    
    @property
    def full_name(self):
        name_parts = [self.first_name]
        if self.middle_name:
            name_parts.append(self.middle_name)
        name_parts.append(self.last_name)
        if self.suffix:
            name_parts.append(self.suffix)
        return ' '.join(name_parts)
    
    @property
    def age(self):
        from datetime import date
        today = date.today()
        return today.year - self.birth_date.year - ((today.month, today.day) < (self.birth_date.month, self.birth_date.day))
    
    def save(self, *args, **kwargs):
        if not self.barangay_id:
            self.barangay_id = f"BRG{self.household.purok.id:02d}{Resident.objects.count() + 1:06d}"
        
        super().save(*args, **kwargs)
        
        if not self.qr_code:
            self.generate_qr_code()
    
    def generate_qr_code(self):
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_L,
            box_size=10,
            border=4,
        )
        qr.add_data(f"B-SIMS Resident ID: {self.barangay_id}\nName: {self.full_name}\nHousehold: {self.household.household_number}")
        qr.make(fit=True)
        
        img = qr.make_image(fill_color="black", back_color="white")
        buffer = BytesIO()
        img.save(buffer, format='PNG')
        buffer.seek(0)
        
        self.qr_code.save(
            f'qr_{self.barangay_id}.png',
            ContentFile(buffer.getvalue()),
            save=False
        )
        super().save(update_fields=['qr_code'])


class DocumentType(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    required_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    validity_days = models.IntegerField(default=30)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['name']
    
    def __str__(self):
        return self.name


class DocumentRequest(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('released', 'Released'),
        ('rejected', 'Rejected'),
    ]
    
    request_number = models.CharField(max_length=20, unique=True, blank=True)
    resident = models.ForeignKey(Resident, on_delete=models.CASCADE, related_name='document_requests')
    document_type = models.ForeignKey(DocumentType, on_delete=models.CASCADE, related_name='requests')
    purpose = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    fee_paid = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    requested_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='document_requests')
    approved_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='approved_documents')
    approved_at = models.DateTimeField(null=True, blank=True)
    released_at = models.DateTimeField(null=True, blank=True)
    remarks = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.request_number} - {self.resident.full_name}"
    
    def save(self, *args, **kwargs):
        if not self.request_number:
            self.request_number = f"DOC{self.document_type.id:02d}{DocumentRequest.objects.count() + 1:06d}"
        super().save(*args, **kwargs)
    
    @property
    def is_expired(self):
        if self.status == 'released' and self.released_at:
            from datetime import datetime, timedelta
            expiry_date = self.released_at + timedelta(days=self.document_type.validity_days)
            return datetime.now() > expiry_date
        return False


class Blotter(models.Model):
    STATUS_CHOICES = [
        ('open', 'Open'),
        ('under_investigation', 'Under Investigation'),
        ('settled', 'Settled'),
        ('closed', 'Closed'),
    ]
    
    INCIDENT_TYPE_CHOICES = [
        ('theft', 'Theft'),
        ('assault', 'Assault'),
        ('dispute', 'Dispute'),
        ('noise', 'Noise Complaint'),
        ('property', 'Property Damage'),
        ('other', 'Other'),
    ]
    
    blotter_number = models.CharField(max_length=20, unique=True, blank=True)
    complainant_name = models.CharField(max_length=200)
    complainant_address = models.TextField()
    complainant_contact = models.CharField(max_length=15, blank=True)
    respondent_name = models.CharField(max_length=200, blank=True)
    respondent_address = models.TextField(blank=True)
    respondent_contact = models.CharField(max_length=15, blank=True)
    incident_type = models.CharField(max_length=20, choices=INCIDENT_TYPE_CHOICES)
    incident_date = models.DateTimeField()
    incident_location = models.TextField()
    summary = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='open')
    resolution = models.TextField(blank=True)
    recorded_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='blotters')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.blotter_number} - {self.complainant_name}"
    
    def save(self, *args, **kwargs):
        if not self.blotter_number:
            self.blotter_number = f"BLT{Blotter.objects.count() + 1:06d}"
        super().save(*args, **kwargs)


class Complaint(models.Model):
    STATUS_CHOICES = [
        ('received', 'Received'),
        ('acknowledged', 'Acknowledged'),
        ('in_progress', 'In Progress'),
        ('resolved', 'Resolved'),
        ('closed', 'Closed'),
    ]
    
    INCIDENT_TYPE_CHOICES = [
        ('disturbance', 'Disturbance'),
        ('missing_item', 'Missing Item'),
        ('accident', 'Accident'),
        ('property_damage', 'Property Damage'),
        ('noise_complaint', 'Noise Complaint'),
        ('health_concern', 'Health Concern'),
        ('sanitation', 'Sanitation Issue'),
        ('streetlight', 'Streetlight/Infrastructure'),
        ('stray_animals', 'Stray Animals'),
        ('other', 'Other'),
    ]
    
    title = models.CharField(max_length=200)
    incident_type = models.CharField(max_length=50, choices=INCIDENT_TYPE_CHOICES, default='other')
    details = models.TextField()
    submitted_by = models.ForeignKey(Resident, on_delete=models.CASCADE, related_name='complaints')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='received')
    response = models.TextField(blank=True)
    responded_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='responded_complaints')
    responded_at = models.DateTimeField(null=True, blank=True)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    location_address = models.CharField(max_length=500, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Incident/Complaint'
        verbose_name_plural = 'Incidents/Complaints'
    
    def __str__(self):
        return f"{self.title} - {self.submitted_by.full_name}"


class ComplaintAttachment(models.Model):
    complaint = models.ForeignKey(Complaint, on_delete=models.CASCADE, related_name='attachments')
    image = models.ImageField(upload_to='complaints/')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['created_at']
    
    def __str__(self):
        return f"Attachment for {self.complaint.title}"