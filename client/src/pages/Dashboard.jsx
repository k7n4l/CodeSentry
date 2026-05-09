import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import CodeEditor from "../components/CodeEditor";
import ReviewResult from "../components/ReviewResult";
import ReviewHistory from "../components/ReviewHistory.jsx";
import "../styles/Auth.css";
import "../styles/Dashboard.css";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [reviewResult, setReviewResult] = useState(null);
  const [selectedHistoryReview, setSelectedHistoryReview] = useState(null);

  const handleReviewComplete = (result) => {
    setReviewResult(result);
    setSelectedHistoryReview(null);
    // Refresh history after new review
    window.dispatchEvent(new Event("refreshHistory"));
  };

  const handleSelectHistoryReview = (review) => {
    setSelectedHistoryReview(review);
    setReviewResult(null);
  };

  const displayResult = selectedHistoryReview || reviewResult;

  return (
    <div className="dashboard">
      {/* Sidebar */}
      <aside className="dashboard-sidebar">
        <div className="sidebar-header">
          <h2>🛡️ CodeSentry</h2>
        </div>

        <nav className="sidebar-nav">
          <a href="#" className="nav-item active">
            <span className="nav-icon">📊</span>
            <span>Dashboard</span>
          </a>
          <a href="#" className="nav-item">
            <span className="nav-icon">📝</span>
            <span>Reviews</span>
          </a>
          <a href="#" className="nav-item">
            <span className="nav-icon">⚙️</span>
            <span>Settings</span>
          </a>
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="user-details">
              <div className="user-name">{user?.name}</div>
              <div className="user-email">{user?.email}</div>
            </div>
          </div>
          <button onClick={logout} className="logout-btn">
            🚪 Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="dashboard-main">
        <header className="dashboard-header">
          <h1>Welcome back, {user?.name?.split(" ")[0]}! 👋</h1>
          <p>Review your code for security vulnerabilities</p>
        </header>

        <div className="dashboard-content">
          <div className="content-left">
            <CodeEditor onReviewComplete={handleReviewComplete} />
            {displayResult && <ReviewResult result={displayResult} />}
          </div>

          <div className="content-right">
            <ReviewHistory onSelectReview={handleSelectHistoryReview} />
          </div>
        </div>
      </main>
    </div>
  );
}
