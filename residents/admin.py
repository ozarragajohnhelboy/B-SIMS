from django.contrib import admin
from .models import Purok, Household, Resident, DocumentType, DocumentRequest, Blotter, Complaint, ComplaintAttachment


@admin.register(Purok)
class PurokAdmin(admin.ModelAdmin):
    list_display = ('name', 'description', 'created_at')
    search_fields = ('name', 'description')
    readonly_fields = ('created_at',)


@admin.register(Household)
class HouseholdAdmin(admin.ModelAdmin):
    list_display = ('household_number', 'purok', 'address', 'contact_number', 'created_at')
    list_filter = ('purok', 'created_at')
    search_fields = ('household_number', 'address', 'contact_number')
    readonly_fields = ('household_number', 'created_at', 'updated_at')


@admin.register(Resident)
class ResidentAdmin(admin.ModelAdmin):
    list_display = ('full_name', 'barangay_id', 'age', 'gender', 'household', 'is_voter', 'is_pwd', 'is_senior_citizen')
    list_filter = ('gender', 'marital_status', 'is_voter', 'is_pwd', 'is_senior_citizen', 'household__purok', 'created_at')
    search_fields = ('first_name', 'last_name', 'middle_name', 'barangay_id', 'household__household_number')
    readonly_fields = ('barangay_id', 'created_at', 'updated_at', 'age', 'qr_code')
    
    fieldsets = (
        ('Personal Information', {
            'fields': ('user', 'barangay_id', 'first_name', 'last_name', 'middle_name', 'suffix', 'birth_date', 'gender', 'marital_status')
        }),
        ('Employment & Income', {
            'fields': ('occupation', 'monthly_income')
        }),
        ('Household Information', {
            'fields': ('household', 'relationship_to_head')
        }),
        ('Emergency Contact', {
            'fields': ('emergency_contact_name', 'emergency_contact_number')
        }),
        ('Status', {
            'fields': ('is_voter', 'is_pwd', 'is_senior_citizen')
        }),
        ('QR Code', {
            'fields': ('qr_code',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(DocumentType)
class DocumentTypeAdmin(admin.ModelAdmin):
    list_display = ('name', 'required_fee', 'validity_days', 'is_active', 'created_at')
    list_filter = ('is_active', 'created_at')
    search_fields = ('name', 'description')
    readonly_fields = ('created_at',)


@admin.register(DocumentRequest)
class DocumentRequestAdmin(admin.ModelAdmin):
    list_display = ('request_number', 'resident', 'document_type', 'status', 'fee_paid', 'created_at')
    list_filter = ('status', 'document_type', 'created_at')
    search_fields = ('request_number', 'resident__first_name', 'resident__last_name', 'purpose')
    readonly_fields = ('request_number', 'created_at', 'updated_at')
    
    fieldsets = (
        ('Request Information', {
            'fields': ('request_number', 'resident', 'document_type', 'purpose')
        }),
        ('Status & Payment', {
            'fields': ('status', 'fee_paid', 'remarks')
        }),
        ('Processing', {
            'fields': ('requested_by', 'approved_by', 'approved_at', 'released_at')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(Blotter)
class BlotterAdmin(admin.ModelAdmin):
    list_display = ('blotter_number', 'complainant_name', 'respondent_name', 'incident_type', 'status', 'incident_date')
    list_filter = ('status', 'incident_type', 'incident_date', 'created_at')
    search_fields = ('blotter_number', 'complainant_name', 'respondent_name', 'summary')
    readonly_fields = ('blotter_number', 'created_at', 'updated_at')
    
    fieldsets = (
        ('Blotter Information', {
            'fields': ('blotter_number', 'incident_type', 'incident_date', 'incident_location', 'summary')
        }),
        ('Complainant', {
            'fields': ('complainant_name', 'complainant_address', 'complainant_contact')
        }),
        ('Respondent', {
            'fields': ('respondent_name', 'respondent_address', 'respondent_contact')
        }),
        ('Status & Resolution', {
            'fields': ('status', 'resolution')
        }),
        ('Record Keeping', {
            'fields': ('recorded_by',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


class ComplaintAttachmentInline(admin.TabularInline):
    model = ComplaintAttachment
    extra = 0


@admin.register(Complaint)
class ComplaintAdmin(admin.ModelAdmin):
    list_display = ('title', 'submitted_by', 'status', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('title', 'details', 'submitted_by__full_name')
    readonly_fields = ('created_at', 'updated_at')
    inlines = [ComplaintAttachmentInline]
    
    fieldsets = (
        ('Complaint Information', {
            'fields': ('title', 'details', 'submitted_by')
        }),
        ('Status & Response', {
            'fields': ('status', 'response', 'responded_by', 'responded_at')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(ComplaintAttachment)
class ComplaintAttachmentAdmin(admin.ModelAdmin):
    list_display = ('complaint', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('complaint__title',)
    readonly_fields = ('created_at',)