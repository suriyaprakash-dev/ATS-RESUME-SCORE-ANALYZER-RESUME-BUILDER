from django.http import JsonResponse, HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.core.files.storage import default_storage
from PyPDF2 import PdfReader
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet
from io import BytesIO
import json
from reportlab.lib.enums import TA_CENTER
from reportlab.lib import colors
import os
from reportlab.lib.styles import ParagraphStyle
import logging
import openai
from dotenv import load_dotenv

# Load OpenAI key from .env
load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
logger = logging.getLogger(__name__)





@csrf_exempt
def analyze_resume(request):
    if request.method == 'GET':
        return JsonResponse({'message': 'Analyze resume endpoint is working!'})

    if request.method == 'POST':
        try:
            if 'resume' not in request.FILES:
                return JsonResponse({'error': 'No file uploaded'}, status=400)

            resume_file = request.FILES['resume']
            file_path = default_storage.save(f'{resume_file.name}', resume_file)

            try:
                with default_storage.open(file_path, 'rb') as f:
                    reader = PdfReader(f)
                    resume_text = ''.join([page.extract_text() or '' for page in reader.pages])
            except Exception as pdf_err:
                logger.error(f"PDF Extraction Error: {pdf_err}")
                default_storage.delete(file_path)
                return JsonResponse({'error': 'Error extracting text from PDF.'}, status=400)

            default_storage.delete(file_path)

            if not resume_text.strip():
                return JsonResponse({'error': 'Could not extract text from PDF'}, status=400)

            score = calculate_ats_score(resume_text)
            feedback, suggestions = generate_feedback(resume_text)

            return JsonResponse({'score': score, 'feedback': feedback, 'suggestions': suggestions})

        except Exception as e:
            logger.error(f"Error analyzing resume: {e}")
            return JsonResponse({'error': str(e)}, status=500)

    return JsonResponse({'error': 'Invalid request'}, status=400)

# ✅ Improved Scoring Function
def calculate_ats_score(text):
    keywords = [
        'Python', 'Django', 'Flask', 'React', 'JavaScript', 'HTML', 'CSS', 
        'SQL', 'MySQL', 'PostgreSQL', 'MongoDB', 'Node.js', 'API', 
        'REST', 'Git', 'Teamwork', 'Communication', 'Problem-solving'
    ]

    text_lower = text.lower()
    matches = sum(1 for keyword in keywords if keyword.lower() in text_lower)

    # Normalize score out of 100, maxing at 20 keywords
    normalized_score = int((matches / len(keywords)) * 100)
    return min(normalized_score, 100)

# ✅ Structured Feedback Generator
def generate_feedback(text):
    prompt = f"""
You are an expert resume reviewer. Analyze the following resume and provide:
1. Constructive feedback about the resume.
2. Specific suggestions to improve it.
3. Tips to make it more ATS-friendly.

Resume Text:
{text}
"""

    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo"
,  # Use gpt-4 if available
            messages=[
                {"role": "system", "content": "You are a helpful assistant."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.6,
            max_tokens=600,
        )

        content = response.choices[0].message.content.strip()
        lines = content.split('\n')

        feedback = []
        suggestions = []

        for line in lines:
            lower_line = line.lower()
            if any(word in lower_line for word in ['suggest', 'recommend', 'tip', 'consider']):
                suggestions.append(line.strip())
            elif line.strip():
                feedback.append(line.strip())

        return feedback, suggestions

    except Exception as e:
        logger.error(f"OpenAI API Error: {e}")
        return [f"AI Error: {str(e)}"], []
    
@csrf_exempt
def submit_resume(request):
    logger.info(f"Request method: {request.method}")
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            full_name = data.get('name')
            role = data.get('role')
            email = data.get('email')
            phone_number = data.get('phone')
            linkedin = data.get('linkedin')
            profile_summary = data.get('profileSummary')
            education_details = data.get('education')
            work_experience = data.get('experience')
            skills = data.get('skills')
            projects = data.get('projects')
            certifications = data.get('certifications')

            logger.info(f"Received data: {data}")

            if not full_name or not email:
                return JsonResponse({'error': 'Full Name and Email are required'}, status=400)

            response = HttpResponse(content_type='application/pdf')
            response['Content-Disposition'] = f'attachment; filename=resume_{full_name.replace(" ", "_")}.pdf'

            doc = SimpleDocTemplate(response, pagesize=letter, leftMargin=40, rightMargin=40, topMargin=40, bottomMargin=30)
            styles = getSampleStyleSheet()
            elements = []

            # Custom Styles
            title_style = ParagraphStyle(name='TitleStyle', fontSize=24, leading=28, spaceAfter=12, alignment=TA_CENTER)
            role_style = ParagraphStyle(name='RoleStyle', parent=styles['Heading3'], alignment=TA_CENTER)
            section_heading = ParagraphStyle(name='SectionHeading', fontSize=14, leading=18, spaceAfter=6, textColor=colors.darkblue)
            normal_style = styles['Normal']

            def add_line():
                elements.append(Spacer(1, 6))
                elements.append(Paragraph('<hr/>', normal_style))
                elements.append(Spacer(1, 6))

            # Header: Name and Role (centered)
            elements.append(Paragraph(full_name, title_style))
            if role:
                elements.append(Paragraph(f"<i>{role}</i>", role_style))
            add_line()

            # Contact Info
            contact_info = f"<b>Email:</b> {email} &nbsp;&nbsp;&nbsp; <b>Phone:</b> {phone_number or 'N/A'} &nbsp;&nbsp;&nbsp; <b>LinkedIn:</b> {linkedin or 'N/A'}"
            elements.append(Paragraph(contact_info, normal_style))
            add_line()

            # Profile Summary
            if profile_summary:
                elements.append(Paragraph("Profile Summary", section_heading))
                elements.append(Paragraph(profile_summary, normal_style))
                add_line()

            # Education (no bullets)
            if education_details:
                elements.append(Paragraph("Education", section_heading))
                for edu in education_details.split('\n'):
                    elements.append(Paragraph(edu.strip(), normal_style))
                add_line()

            # Experience (with bullets)
            if work_experience:
                elements.append(Paragraph("Work Experience", section_heading))
                for exp in work_experience.split('\n'):
                    elements.append(Paragraph(f"• {exp}", normal_style))
                add_line()

            # Skills
            if skills:
                elements.append(Paragraph("Skills", section_heading))
                elements.append(Paragraph(skills.replace(',', ', '), normal_style))
                add_line()

            # Projects (with bullets)
            if projects:
                elements.append(Paragraph("Projects", section_heading))
                for proj in projects.split('\n'):
                    elements.append(Paragraph(f"• {proj}", normal_style))
                add_line()

            # Certifications (with bullets)
            if certifications:
                elements.append(Paragraph("Certifications", section_heading))
                for cert in certifications.split('\n'):
                    elements.append(Paragraph(f"• {cert}", normal_style))
                add_line()

            # Build PDF
            doc.build(elements)
            logger.info(f"Generated resume for {full_name}")
            return response

        except json.JSONDecodeError:
            logger.error('Invalid JSON received')
            return JsonResponse({'error': 'Invalid JSON'}, status=400)
        except Exception as e:
            logger.error(f"Unexpected error: {str(e)}")
            return JsonResponse({'error': 'Internal Server Error'}, status=500)

    logger.warning('Invalid request method used')
    return JsonResponse({'error': 'Invalid request method'}, status=405)
