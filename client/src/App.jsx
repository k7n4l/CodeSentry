import React from "react";
import { useState } from "react";
import CodeEditor from "./components/CodeEditor";
import ReviewResults from "./components/ReviewResult";
import ReviewHistory from "./components/ReviewHistory";
import "./App.css";

function App() {
  const [reviewResult, setReviewResult] = useState(null);
  const [selectedHistoryReview, setSelectedHistoryReview] = useState(null);

  const handleReviewComplete = (result) => {
    setReviewResult(result);
    setSelectedHistoryReview(null); // Clear selected history review when a new review is completed
  };

  const handleViewHistoryReview = (review) => {
    setSelectedHistoryReview(review);
    setReviewResult(null); // Clear current review result when viewing a history review
  };

  const displayResult = selectedHistoryReview || reviewResult;

  return (
    <div className="App">
      <header>
        <h1>🛡️ CodeSentry</h1>
        <p>AI-Powered Security Code Review</p>
      </header>

      <div className="main-content">
        <div className="left-panel">
          <CodeEditor onReviewComplete={handleReviewComplete} />
          {displayResult && <ReviewResults result={displayResult} />}
        </div>

        <div className="right-panel">
          <ReviewHistory onSelectReview={handleViewHistoryReview} />
        </div>
      </div>
    </div>
  );
}
export default App;
