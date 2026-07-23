# apps/certificates/views.py
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from rest_framework.views import APIView
from django.http import HttpResponse
from django.shortcuts import get_object_or_404
from django.conf import settings
from io import BytesIO
from reportlab.lib.pagesizes import A4, landscape
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Image, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch, cm
from reportlab.lib import colors
from reportlab.graphics.shapes import Drawing
from reportlab.graphics.barcode.qr import QrCodeWidget
from reportlab.lib.enums import TA_CENTER, TA_LEFT
import qrcode
from PIL import Image as PILImage
import os
from .models import Certificate
from .serializers import CertificateSerializer, CertificateDetailSerializer, CertificateVerifySerializer
from apps.progress.models import CourseEnrollment


class StandardResultsSetPagination(PageNumberPagination):
    page_size = 3
    page_size_query_param = 'page_size'
    max_page_size = 20
    
    
class CertificateListView(generics.ListAPIView):
    """Get all certificates for the authenticated user with pagination"""
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = CertificateSerializer
    pagination_class = StandardResultsSetPagination
    
    def get_queryset(self):
        user = self.request.user
        
        # ✅ Auto-generate certificates for completed courses without one
        from apps.progress.models import CourseEnrollment
        completed_enrollments = CourseEnrollment.objects.filter(
            user=user,
            is_completed=True
        )
        
        for enrollment in completed_enrollments:
            has_cert = Certificate.objects.filter(
                user=user,
                course=enrollment.course
            ).exists()
            
            if not has_cert:
                try:
                    Certificate.issue_certificate(user, enrollment.course)
                    print(f"✅ Auto-issued certificate for {user.email} - {enrollment.course.title}")
                except Exception as e:
                    print(f"❌ Failed to auto-issue certificate: {e}")
        
        return Certificate.objects.filter(user=user, is_active=True)
    

class CertificateDetailView(generics.RetrieveAPIView):
    """Get certificate details"""
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = CertificateDetailSerializer
    
    def get_queryset(self):
        return Certificate.objects.filter(user=self.request.user, is_active=True)
    
    def get_object(self):
        return get_object_or_404(
            Certificate,
            id=self.kwargs['id'],
            user=self.request.user,
            is_active=True
        )

class CertificateEligibilityView(APIView):
    """Check if user is eligible for certificate"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request, course_id):
        from apps.courses.models import Course
        course = get_object_or_404(Course, id=course_id)
        
        is_eligible = Certificate.is_eligible(request.user, course)
        has_certificate = Certificate.objects.filter(
            user=request.user,
            course=course,
            is_active=True
        ).exists()
        
        # Get progress details
        from apps.progress.models import UserProgress
        total_lessons = course.lessons.count()
        completed_lessons = UserProgress.objects.filter(
            user=request.user,
            lesson__course=course,
            completed=True
        ).count()
        
        return Response({
            'is_eligible': is_eligible,
            'has_certificate': has_certificate,
            'total_lessons': total_lessons,
            'completed_lessons': completed_lessons,
            'progress_percentage': (completed_lessons / total_lessons * 100) if total_lessons > 0 else 0
        })

class CertificateIssueView(APIView):
    """Issue certificate for a course"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, course_id):
        from apps.courses.models import Course
        course = get_object_or_404(Course, id=course_id)
        
        certificate, message = Certificate.issue_certificate(request.user, course)
        
        if certificate:
            return Response({
                'status': 'success',
                'message': message,
                'certificate': CertificateSerializer(certificate).data
            }, status=status.HTTP_201_CREATED)
        
        return Response({
            'status': 'error',
            'message': message
        }, status=status.HTTP_400_BAD_REQUEST)

class CertificateDownloadView(APIView):
    """Download certificate as PDF"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request, id):
        try:
            certificate = get_object_or_404(
                Certificate,
                id=id,
                user=request.user,
                is_active=True
            )
            
            # Increment download count
            certificate.increment_download()
            
            # Generate PDF
            pdf_buffer = self.generate_certificate_pdf(certificate)
            
            # Create response
            response = HttpResponse(pdf_buffer, content_type='application/pdf')
            response['Content-Disposition'] = f'attachment; filename="certificate_{certificate.certificate_id}.pdf"'
            return response
            
        except Exception as e:
            print(f"❌ PDF Generation Error: {e}")
            import traceback
            traceback.print_exc()
            return Response({
                'error': f'Failed to generate certificate: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def generate_certificate_pdf(self, certificate):
        """Generate PDF certificate using ReportLab"""
        buffer = BytesIO()
        
        try:
            # Create PDF document
            doc = SimpleDocTemplate(
                buffer,
                pagesize=landscape(A4),
                rightMargin=0.5*inch,
                leftMargin=0.5*inch,
                topMargin=0.5*inch,
                bottomMargin=0.5*inch,
            )
            
            # Styles
            styles = getSampleStyleSheet()
            
            title_style = ParagraphStyle(
                'TitleStyle',
                parent=styles['Heading1'],
                fontSize=32,
                textColor=colors.HexColor('#0A3D62'),
                alignment=TA_CENTER,
                spaceAfter=20,
                fontName='Helvetica-Bold'
            )
            
            subtitle_style = ParagraphStyle(
                'SubtitleStyle',
                parent=styles['Heading2'],
                fontSize=18,
                textColor=colors.HexColor('#00B894'),
                alignment=TA_CENTER,
                spaceAfter=30,
                fontName='Helvetica'
            )
            
            name_style = ParagraphStyle(
                'NameStyle',
                parent=styles['Heading1'],
                fontSize=36,
                textColor=colors.HexColor('#0A3D62'),
                alignment=TA_CENTER,
                spaceAfter=20,
                fontName='Helvetica-Bold'
            )
            
            body_style = ParagraphStyle(
                'BodyStyle',
                parent=styles['Normal'],
                fontSize=14,
                textColor=colors.HexColor('#1C2C3E'),
                alignment=TA_CENTER,
                spaceAfter=10,
                fontName='Helvetica'
            )
            
            info_style = ParagraphStyle(
                'InfoStyle',
                parent=styles['Normal'],
                fontSize=12,
                textColor=colors.HexColor('#666666'),
                alignment=TA_CENTER,
                fontName='Helvetica'
            )
            
            # Build content
            story = []
            
            # Border
            story.append(Spacer(1, 0.5*inch))
            
            # Certificate Title
            story.append(Paragraph("🐟 AquaLearn", title_style))
            story.append(Paragraph("Certificate of Completion", subtitle_style))
            
            story.append(Spacer(1, 0.5*inch))
            
            # Body text
            story.append(Paragraph("This certifies that", body_style))
            
            # User Name
            user_name = certificate.user.get_full_name() or certificate.user.email
            story.append(Paragraph(user_name, name_style))
            
            # Course
            story.append(Paragraph(f"has successfully completed the course", body_style))
            story.append(Paragraph(f"<b>{certificate.course.title}</b>", body_style))
            
            story.append(Spacer(1, 0.5*inch))
            
            # Details table
            details_data = [
                ['Date Issued', 'Certificate ID', 'Verification Code'],
                [
                    certificate.issued_at.strftime('%B %d, %Y'),
                    certificate.certificate_id,
                    certificate.get_verification_code()
                ]
            ]
            
            details_table = Table(details_data, colWidths=[2.5*inch, 2*inch, 2.5*inch])
            details_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#0A3D62')),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, 0), 10),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 8),
                ('BACKGROUND', (0, 1), (-1, -1), colors.HexColor('#F0F7F4')),
                ('TEXTCOLOR', (0, 1), (-1, -1), colors.HexColor('#1C2C3E')),
                ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
                ('FONTSIZE', (0, 1), (-1, -1), 10),
                ('TOPPADDING', (0, 1), (-1, -1), 6),
                ('BOTTOMPADDING', (0, 1), (-1, -1), 6),
                ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#0A3D62')),
            ]))
            
            story.append(details_table)
            story.append(Spacer(1, 0.5*inch))
            
            # ✅ Add QR code - FIXED: Keep the file until after PDF is built
            qr_image = None
            qr_path = None
            
            try:
                verification_url = f"{settings.FRONTEND_URL}/verify/{certificate.certificate_id}/{certificate.get_verification_code()}"
                
                # Generate QR code
                qr = qrcode.QRCode(version=1, box_size=10, border=4)
                qr.add_data(verification_url)
                qr.make(fit=True)
                qr_img = qr.make_image(fill_color="#0A3D62", back_color="white")
                
                # Save QR code to a persistent temporary file
                import tempfile
                # ✅ Use NamedTemporaryFile with delete=False so it persists
                temp_file = tempfile.NamedTemporaryFile(suffix='.png', delete=False)
                qr_path = temp_file.name
                temp_file.close()  # Close the file handle
                qr_img.save(qr_path)  # Save the image
                
                # Add QR code to PDF
                from reportlab.platypus import Image as ReportLabImage
                story.append(Spacer(1, 0.2*inch))
                story.append(Paragraph("Verify this certificate by scanning the QR code", info_style))
                story.append(Spacer(1, 0.1*inch))
                
                qr_image = ReportLabImage(qr_path, width=1.5*inch, height=1.5*inch)
                story.append(qr_image)
                
            except Exception as qr_error:
                print(f"⚠️ QR Code generation skipped: {qr_error}")
                # Continue without QR code
            
            story.append(Spacer(1, 0.3*inch))
            
            # Signature
            story.append(Paragraph("_________________________", body_style))
            story.append(Paragraph("Course Instructor", info_style))
            story.append(Spacer(1, 0.1*inch))
            story.append(Paragraph("AquaLearn Team", info_style))
            
            # Build document
            doc.build(story)
            
            # ✅ Clean up QR code file after PDF is built
            if qr_path and os.path.exists(qr_path):
                try:
                    os.remove(qr_path)
                except Exception as e:
                    print(f"⚠️ Could not remove temp file: {e}")
            
        except Exception as e:
            print(f"❌ PDF generation error: {e}")
            import traceback
            traceback.print_exc()
            raise
        
        # Get PDF data
        pdf_data = buffer.getvalue()
        buffer.close()
        
        return pdf_data

class CertificateVerifyView(APIView):
    """Verify certificate authenticity"""
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = CertificateVerifySerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        certificate_id = serializer.validated_data['certificate_id']
        verification_code = serializer.validated_data['verification_code']
        
        try:
            certificate = Certificate.objects.get(
                certificate_id=certificate_id,
                is_active=True
            )
            
            # Verify code
            if certificate.get_verification_code() == verification_code:
                return Response({
                    'valid': True,
                    'certificate': {
                        'certificate_id': certificate.certificate_id,
                        'user_name': certificate.user.get_full_name(),
                        'course_title': certificate.course.title,
                        'issued_at': certificate.issued_at,
                        'issued_by': 'AquaLearn'
                    }
                })
        except Certificate.DoesNotExist:
            pass
        
        return Response({
            'valid': False,
            'message': 'Invalid certificate ID or verification code'
        }, status=status.HTTP_404_NOT_FOUND)

class CertificateShareView(APIView):
    """Get shareable certificate link"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request, id):
        certificate = get_object_or_404(
            Certificate,
            id=id,
            user=request.user,
            is_active=True
        )
        
        share_url = f"{settings.FRONTEND_URL}/verify/{certificate.certificate_id}/{certificate.get_verification_code()}"
        
        return Response({
            'share_url': share_url,
            'certificate_id': certificate.certificate_id,
            'verification_code': certificate.get_verification_code()
        })
        
        
class CertificateCheckMissingView(APIView):
    """Check for completed courses without certificates"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        from apps.progress.models import CourseEnrollment
        
        # Get all completed enrollments
        completed_enrollments = CourseEnrollment.objects.filter(
            user=request.user,
            is_completed=True
        )
        
        missing_certificates = []
        for enrollment in completed_enrollments:
            has_cert = Certificate.objects.filter(
                user=request.user,
                course=enrollment.course
            ).exists()
            
            if not has_cert:
                missing_certificates.append({
                    'course_id': enrollment.course.id,
                    'course_title': enrollment.course.title,
                    'completed_at': enrollment.completed_at
                })
        
        return Response({
            'missing_certificates': missing_certificates
        })