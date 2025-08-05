import React, { useState } from 'react';
import axios from 'axios';
import { Link, Routes, Route } from 'react-router-dom';
import ResumeBuild from './pages/ResumeBuild';
import ScoreCheck from './pages/ScoreCheck';
import Results from './pages/Results';
import './App.css';

// 🟢 Recharts PieChart import
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

function App() {
    const [file, setFile] = useState(null);
    const [feedback, setFeedback] = useState([]);
    const [score, setScore] = useState(null);
    const [suggestions, setSuggestions] = useState([]);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleSubmit = async(e) => {
        e.preventDefault();
        if (!file) {
            setFeedback(['Please upload a PDF file.']);
            return;
        }

        const formData = new FormData();
        formData.append('resume', file);

        try {
            const response = await axios.post('http://127.0.0.1:8000/api/analyze/', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            setScore(response.data.score);
            setFeedback(response.data.feedback || []);
            setSuggestions(response.data.suggestions || []);
        } catch (error) {
            console.error('Error analyzing resume:', error);
            setFeedback(['Something went wrong. Please try again.']);
        }
    };

    // 🟢 Pie chart data for Resume Score
    const pieChartData = score !== null ? [
        { name: 'Matched', value: score },
        { name: 'Remaining', value: 100 - score }
    ] : [];

    const pieColors = ['#00C49F', '#f0f0f0'];

    return ( <
        div className = "app-container" > { /* Sidebar Navigation */ } <
        nav className = "sidebar" >
        <
        h2 className = "logo" > AI Resume Checker < /h2> <
        ul >
        <
        li > < Link to = "/" > 🏠Home < /Link></li >
        <
        li > < Link to = "/resume-build" > 📄Resume Build < /Link></li >
        <
        li > < Link to = "/score-check" > 📊Score Check < /Link></li >
        <
        li > < Link to = "/results" > 📜Results < /Link></li >
        <
        /ul> <
        /nav>

        { /* Main Content */ } <
        div className = "main-content" >
        <
        Routes >
        <
        Route path = "/"
        element = { <
            div className = "main-container" >
            <
            h1 className = "title" > AI Resume Checker & ATS Score Checker < /h1> <
            form onSubmit = { handleSubmit }
            className = "upload-form" >
            <
            input type = "file"
            accept = "application/pdf"
            onChange = { handleFileChange }
            /> <
            button type = "submit" > Analyze Resume < /button> <
            /form>

            { /* Results Section */ } {
                score !== null && ( <
                    div className = "result-container" >
                    <
                    h3 > Score: { score } % < /h3>

                    { /* 🟢 Donut/Pie Chart */ } <
                    div style = {
                        { textAlign: 'center' } } >
                    <
                    PieChart width = { 250 }
                    height = { 250 } >
                    <
                    Pie data = { pieChartData }
                    cx = "50%"
                    cy = "50%"
                    innerRadius = { 60 }
                    outerRadius = { 90 }
                    dataKey = "value" >
                    {
                        pieChartData.map((_, index) => ( <
                            Cell key = { `cell-${index}` }
                            fill = { pieColors[index % pieColors.length] }
                            />
                        ))
                    } <
                    /Pie> <
                    Tooltip / >
                    <
                    Legend / >
                    <
                    /PieChart> <
                    div style = {
                        {
                            marginTop: '-140px',
                            fontSize: '24px',
                            fontWeight: 'bold',
                            color: '#00C49F',
                            position: 'relative'
                        }
                    } > { score } %
                    <
                    /div> <
                    /div>

                    { /* Feedback */ } <
                    ul > {
                        feedback.map((item, index) => ( <
                            li key = { index } > { item } < /li>
                        ))
                    } <
                    /ul>

                    { /* Suggestions */ } {
                        suggestions.length > 0 && ( <
                            div className = "suggestions-container" >
                            <
                            h4 > Suggestions
                            for Improvement: < /h4> <
                            ul > {
                                suggestions.map((suggestion, index) => ( <
                                    li key = { index } > { suggestion } < /li>
                                ))
                            } <
                            /ul> <
                            /div>
                        )
                    } <
                    /div>
                )
            } <
            /div>
        }
        /> <
        Route path = "/resume-build"
        element = { < ResumeBuild / > }
        /> <
        Route path = "/score-check"
        element = { < ScoreCheck / > }
        /> <
        Route path = "/results"
        element = { < Results feedback = { feedback }
            score = { score }
            suggestions = { suggestions }
            />} / >
            <
            /Routes> <
            /div> <
            /div>
        );
    }

    export default App;