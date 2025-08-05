import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import ResumeBuild from './pages/ResumeBuild';
import ScoreCheck from './pages/ScoreCheck';
import Results from './pages/Results';

function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/resume-build" element={<ResumeBuild />} />
      <Route path="/score-check" element={<ScoreCheck />} />
      <Route path="/results" element={<Results />} />
    </Routes>
  );
}

export default AppRouter;
