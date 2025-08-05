import React from 'react';

function Results({ score = 0, feedback = [], suggestions = [] }) {
  const feedbackArray = Array.isArray(feedback) ? feedback : [feedback];

  return (
    <div className="results-container">
      <h2>Resume Check Results</h2>

      <div className="section">
        <h3>ATS Score</h3>
        <div className="score-bar">
          <div className="score" style={{ width: `${score}%` }}>{score}%</div>
        </div>
      </div>

      {feedbackArray.length > 0 && feedbackArray[0] && (
        <div className="section">
          <h3>Feedback</h3>
          <ul>
            {feedbackArray.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      {suggestions.length > 0 && (
        <div className="section">
          <h3>Suggestions for Improvement</h3>
          <ul>
            {suggestions.map((suggestion, index) => (
              <li key={index}>{suggestion}</li>
            ))}
          </ul>
        </div>
      )}

      <button className="download-btn" onClick={() => alert('Downloading PDF...')}>
        Download Results as PDF
      </button>
    </div>
  );
}

export default Results;
