from django.contrib import admin
from . import views
from django.urls import path
from django.urls import path, include


urlpatterns = [
    path('admin/', admin.site.urls),  
    path('api/analyze/', views.analyze_resume, name='analyze_resume'),
    path('api/submit-resume/', views.submit_resume, name='submit_resume'),
    
    path('api/', include('resume_checker.urls')),
]


