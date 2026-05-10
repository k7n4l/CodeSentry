import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import CodeEditor from "../components/CodeEditor";
import ReviewResults from "../components/ReviewResult";
import ReviewHistory from "../components/ReviewHistory";
import Reviews from "./Review";
import Settings from "./Settings";
import logoImg from "../assets/logo.png";
import "../styles/Dashboard.css";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [reviewResult, setReviewResult] = useState(null);
  const [selectedHistoryReview, setSelectedHistoryReview] = useState(null);

  const handleReviewComplete = (result) => {
    setReviewResult(result);
    setSelectedHistoryReview(null);
    window.dispatchEvent(new Event("refreshHistory"));
  };

  const handleSelectHistoryReview = (review) => {
    setSelectedHistoryReview(review);
    setReviewResult(null);
  };

  const displayResult = selectedHistoryReview || reviewResult;

  const renderContent = () => {
    switch (currentPage) {
      case "dashboard":
        return (
          <>
            <header className="dashboard-header">
              <h1>Welcome back, {user?.name?.split(" ")[0]}! 👋</h1>
              <p>Review your code for security vulnerabilities</p>
            </header>
            <div className="dashboard-content">
              <div className="content-left">
                <CodeEditor onReviewComplete={handleReviewComplete} />
                {displayResult && <ReviewResults result={displayResult} />}
              </div>
              <div className="content-right">
                <ReviewHistory onSelectReview={handleSelectHistoryReview} />
              </div>
            </div>
          </>
        );
      case "reviews":
        return <Reviews />;
      case "settings":
        return <Settings />;
      default:
        return null;
    }
  };

  return (
    <div className="dashboard">
      <aside className="dashboard-sidebar">
        <div className="sidebar-header">
          <img src={logoImg} alt="CodeSentry Logo" className="sidebar-logo" />
        </div>

        <nav className="sidebar-nav">
          <a
            href="#"
            className={`nav-item ${currentPage === "dashboard" ? "active" : ""}`}
            onClick={(e) => {
              e.preventDefault();
              setCurrentPage("dashboard");
            }}
          >
            <span className="nav-icon">📊</span>
            <span>Dashboard</span>
          </a>
          <a
            href="#"
            className={`nav-item ${currentPage === "reviews" ? "active" : ""}`}
            onClick={(e) => {
              e.preventDefault();
              setCurrentPage("reviews");
            }}
          >
            <span className="nav-icon">📝</span>
            <span>Reviews</span>
          </a>
          <a
            href="#"
            className={`nav-item ${currentPage === "settings" ? "active" : ""}`}
            onClick={(e) => {
              e.preventDefault();
              setCurrentPage("settings");
            }}
          >
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

      <main className="dashboard-main">{renderContent()}</main>
    </div>
  );
}
