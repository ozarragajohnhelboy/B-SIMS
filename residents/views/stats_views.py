from rest_framework import permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.db.models import Count
from ..models import Resident, DocumentRequest, Blotter

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
