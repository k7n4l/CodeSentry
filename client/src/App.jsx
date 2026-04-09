import React from "react";
import { useState } from "react";
import CodeEditor from "./components/CodeEditor";
import ReviewResults from "./components/ReviewResult";
import "./App.css";

function App() {
  const [reviewResult, setReviewResult] = useState(null);
  return (
    <div className="App">
      <CodeEditor onReviewComplete={setReviewResult} />
      <ReviewResults result={reviewResult} />
    </div>
  );
}
export default App;
