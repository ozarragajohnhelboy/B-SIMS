from rest_framework import permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Count, Q
from django.utils import timezone
from datetime import datetime, timedelta
from residents.models import Resident, DocumentRequest, Blotter
from django.contrib.auth import get_user_model

User = get_user_model()


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def resident_stats_view(request):
    total_residents = Resident.objects.count()
    voters = Resident.objects.filter(is_voter=True).count()
    pwd = Resident.objects.filter(is_pwd=True).count()
    senior_citizens = Resident.objects.filter(is_senior_citizen=True).count()
    
    gender_stats = Resident.objects.values('gender').annotate(count=Count('id'))
    purok_stats = Resident.objects.values('household__purok__name').annotate(count=Count('id'))
    
    return Response({
        'total_residents': total_residents,
        'voters': voters,
        'pwd': pwd,
        'senior_citizens': senior_citizens,
        'gender_distribution': list(gender_stats),
        'purok_distribution': list(purok_stats),
    })


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def document_stats_view(request):
    total_requests = DocumentRequest.objects.count()
    pending_requests = DocumentRequest.objects.filter(status='pending').count()
    approved_requests = DocumentRequest.objects.filter(status='approved').count()
    released_requests = DocumentRequest.objects.filter(status='released').count()
    
    return Response({
        'total_requests': total_requests,
        'pending_requests': pending_requests,
        'approved_requests': approved_requests,
        'released_requests': released_requests,
    })


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def blotter_stats_view(request):
    total_blotters = Blotter.objects.count()
    open_cases = Blotter.objects.filter(status='open').count()
    under_investigation = Blotter.objects.filter(status='under_investigation').count()
    settled_cases = Blotter.objects.filter(status='settled').count()
    
    return Response({
        'total_blotters': total_blotters,
        'open_cases': open_cases,
        'under_investigation': under_investigation,
        'settled_cases': settled_cases,
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_stats(request):
    period = request.query_params.get('period', 'month')
    
    if period == 'day':
        days_back = 7
        date_format = '%Y-%m-%d'
        group_by = 'date'
    elif period == 'week':
        weeks_back = 12
        date_format = '%Y-%m-%d'
        group_by = 'week'
    else:
        months_back = 12
        date_format = '%Y-%m'
        group_by = 'month'
    
    end_date = timezone.now().date()
    
    if period == 'day':
        start_date = end_date - timedelta(days=days_back-1)
        dates = [(start_date + timedelta(days=i)) for i in range(days_back)]
    elif period == 'week':
        start_date = end_date - timedelta(weeks=weeks_back-1)
        dates = [(start_date + timedelta(weeks=i)) for i in range(weeks_back)]
    else:
        start_date = end_date.replace(day=1) - timedelta(days=months_back*30)
        dates = []
        current = start_date.replace(day=1)
        while current <= end_date:
            dates.append(current)
            if current.month == 12:
                current = current.replace(year=current.year+1, month=1)
            else:
                current = current.replace(month=current.month+1)
    
    residents_data = []
    voters_data = []
    documents_data = []
    blotters_data = []
    
    for date in dates:
        if period == 'day':
            date_filter = Q(created_at__date=date)
            label = date.strftime('%m/%d')
        elif period == 'week':
            week_start = date
            week_end = date + timedelta(days=6)
            date_filter = Q(created_at__date__gte=week_start, created_at__date__lte=week_end)
            label = f"Week {date.strftime('%m/%d')}"
        else:
            date_filter = Q(created_at__year=date.year, created_at__month=date.month)
            label = date.strftime('%b %Y')
        
        residents_count = Resident.objects.filter(date_filter).count()
        voters_count = Resident.objects.filter(date_filter, is_voter=True).count()
        documents_count = DocumentRequest.objects.filter(date_filter).count()
        blotters_count = Blotter.objects.filter(date_filter).count()
        
        residents_data.append(residents_count)
        voters_data.append(voters_count)
        documents_data.append(documents_count)
        blotters_data.append(blotters_count)
    
    labels = []
    for date in dates:
        if period == 'day':
            labels.append(date.strftime('%m/%d'))
        elif period == 'week':
            labels.append(f"Week {date.strftime('%m/%d')}")
        else:
            labels.append(date.strftime('%b %Y'))
    
    return Response({
        'period': period,
        'labels': labels,
        'residents': residents_data,
        'voters': voters_data,
        'documents': documents_data,
        'blotters': blotters_data
    })