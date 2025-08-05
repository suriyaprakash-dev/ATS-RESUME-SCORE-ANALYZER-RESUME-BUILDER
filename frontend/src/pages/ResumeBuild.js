import React, { useState } from 'react';
import './ResumeBuild.css';
import axios from 'axios';
import Cookies from 'js-cookie'; // Import js-cookie

const ResumeBuilder = () => {
        const [formData, setFormData] = useState({
            name: '',
            role: '',
            email: '',
            phone: '',
            linkedin: '',
            profileSummary: '',
            education: '',
            experience: '',
            skills: '',
            projects: '',
            certifications: '',
        });

        const [error, setError] = useState('');
        const [successMessage, setSuccessMessage] = useState('');

        const handleInputChange = (e) => {
            const { name, value } = e.target;
            setFormData({
                ...formData,
                [name]: value,
            });
        };

        const handleSubmit = async(e) => {
            e.preventDefault();
            setError('');
            setSuccessMessage('');

            try {
                const csrfToken = Cookies.get('csrftoken'); // Get CSRF token from cookie
                const response = await axios.post(
                    'http://127.0.0.1:8000/api/submit-resume/', // Use the full URL of your Django API
                    formData, {
                        headers: {
                            'Content-Type': 'application/json',
                            'X-CSRFToken': csrfToken, // Include CSRF token in headers
                        },
                        responseType: 'blob', // Important for file download
                    }
                );

                if (response.status === 200) {
                    const pdfBlob = new Blob([response.data], { type: 'application/pdf' });
                    const link = document.createElement('a');
                    link.href = URL.createObjectURL(pdfBlob);
                    link.download = `resume_${formData.name.replace(/\s+/g, '_')}.pdf`;
                    link.click();
                    setSuccessMessage('Your resume has been generated successfully!');
                }
            } catch (error) {
                setError('There was an error generating your resume. Please try again.');
                console.error("Error submitting form: ", error); // Log the error for debugging
            }
        };

        return ( <
                div className = "resume-build-container" >
                <
                h2 > Build Your Resume < /h2> <
                form onSubmit = { handleSubmit }
                className = "resume-form" >
                <
                div className = "form-row" >
                <
                input type = "text"
                name = "name"
                placeholder = "Full Name"
                value = { formData.name }
                onChange = { handleInputChange }
                required /
                >
                <
                input type = "text"
                name = "role"
                placeholder = "Role (e.g., Software Developer)"
                value = { formData.role }
                onChange = { handleInputChange }
                required /
                >
                <
                /div>

                <
                div className = "form-row" >
                <
                input type = "email"
                name = "email"
                placeholder = "Email"
                value = { formData.email }
                onChange = { handleInputChange }
                required /
                >
                <
                input type = "text"
                name = "phone"
                placeholder = "Phone Number"
                value = { formData.phone }
                onChange = { handleInputChange }
                required /
                >
                <
                /div>

                <
                input type = "text"
                name = "linkedin"
                placeholder = "LinkedIn Profile URL"
                value = { formData.linkedin }
                onChange = { handleInputChange }
                />

                <
                textarea name = "profileSummary"
                placeholder = "Profile Summary"
                value = { formData.profileSummary }
                onChange = { handleInputChange } >
                < /textarea>

                <
                textarea name = "education"
                placeholder = "Education Details (separate by line)"
                value = { formData.education }
                onChange = { handleInputChange } >
                < /textarea>

                <
                textarea name = "experience"
                placeholder = "Work Experience (separate by line)"
                value = { formData.experience }
                onChange = { handleInputChange } >
                < /textarea>

                <
                textarea name = "skills"
                placeholder = "Skills (separate by line)"
                value = { formData.skills }
                onChange = { handleInputChange } >
                < /textarea>

                <
                textarea name = "projects"
                placeholder = "Projects (separate by line)"
                value = { formData.projects }
                onChange = { handleInputChange } >
                < /textarea>

                <
                textarea name = "certifications"
                placeholder = "Certifications (separate by line)"
                value = { formData.certifications }
                onChange = { handleInputChange } >
                < /textarea>

                <
                button type = "submit" > Generate Resume < /button>

                {
                    error && < p className = "error-text" > { error } < /p>} {
                        successMessage && < p className = "success-text" > { successMessage } < /p>} <
                            /form> <
                            /div>
                    );
                };

                export default ResumeBuilder;