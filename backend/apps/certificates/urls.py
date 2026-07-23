# apps/certificates/urls.py
from django.urls import path
from .views import (
    CertificateListView,
    CertificateDetailView,
    CertificateEligibilityView,
    CertificateIssueView,
    CertificateDownloadView,
    CertificateVerifyView,
    CertificateShareView,
    CertificateCheckMissingView
)

urlpatterns = [
    path('', CertificateListView.as_view(), name='certificate_list'),
    path('<int:id>/', CertificateDetailView.as_view(), name='certificate_detail'),
    path('eligibility/<int:course_id>/', CertificateEligibilityView.as_view(), name='certificate_eligibility'),
    path('issue/<int:course_id>/', CertificateIssueView.as_view(), name='certificate_issue'),
    path('download/<int:id>/', CertificateDownloadView.as_view(), name='certificate_download'),
    path('share/<int:id>/', CertificateShareView.as_view(), name='certificate_share'),
    path('verify/', CertificateVerifyView.as_view(), name='certificate_verify'),
    path('missing/', CertificateCheckMissingView.as_view(), name='certificate_missing'),
]