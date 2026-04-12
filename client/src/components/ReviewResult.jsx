import React from "react";

export default function ReviewResult({ result }) {
  if (!result) {
    return null;
  }

  return (
    <div className="review-results">
      <h3>Security Review Results</h3>
      <div className="timestamps">
        Analyzed at: {new Date(result.timestamp).toLocaleString()}
      </div>
      {
        result.fileName && <div className="file-name">File: {result.fileName}</div>
      }
      <div className="review-content">
        <pre>{result.review}</pre>
      </div>
    </div>
  );
}
