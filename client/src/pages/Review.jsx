import React, { useState, useEffect } from "react";
import axios from "axios";
import ReviewResult from "../components/ReviewResult";
import "../styles/Review.css";

export default function Reviews() {
  const [loading, setLoading] = useState(true);
  const [selectedReview, setSelectedReview] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterSeverity, setFilterSeverity] = useState("all");
  const [filterLanguage, setFilterLanguage] = useState("all");
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    fetchReviews();
  }, []);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape" && isModalOpen) {
        closeModal();
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isModalOpen]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isModalOpen]);

  const fetchReviews = async () => {
    try {
      const response = await axios.get("http://localhost:3001/review/history");
      setReviews(response.data);
    } catch (error) {
      console.error("Failed to fetch history", error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewReview = async (id) => {
    try {
      const response = await axios.get(`http://localhost:3001/review/${id}`);
      setSelectedReview(response.data);
      setIsModalOpen(true);
    } catch (error) {
      console.error("Failed to select review", error);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    // Keep the selectedReview data but close the modal
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      closeModal();
    }
  };

  const handleDeleteReview = async (id) => {
    if (!window.confirm("Are you sure you want to delete review?")) {
      return;
    }
    try {
      await axios.delete(`http://localhost:3001/review/${id}`);
      setReviews(reviews.filter((r) => r._id !== id));
      if (selectedReview?._id === id) {
        closeModal();
        setSelectedReview(null);
      }
      alert("Review deleted successfully");
    } catch (error) {
      console.error("Failed to delete review", error);
      alert("Failed to delete review");
    }
  };

  const getSeverityColor = (severity) => {
    const colors = {
      Critical: "#e74c3c",
      High: "#e67e22",
      Medium: "#f39c12",
      Low: "#3498db",
      Safe: "#27ae60",
    };
    return colors[severity] || "#95a5a6";
  };

  const filteredReviews = reviews.filter((review) => {
    if (filterSeverity !== "all" && review.severityLevel !== filterSeverity) {
      return false;
    }
    if (filterLanguage !== "all" && review.language !== filterLanguage) {
      return false;
    }
    return true;
  });

  const uniqueLanguages = [...new Set(reviews.map((r) => r.language))];

  if (loading) {
    return <div className="reviews-loading">⏳ Loading reviews...</div>;
  }

  return (
    <div className="reviews-page">
      <div className="reviews-header">
        <h1>📝 All Reviews</h1>
        <p>Manage and view all your security reviews</p>
      </div>

      <div className="reviews-filters">
        <div className="filter-group">
          <label>Severity:</label>
          <select
            value={filterSeverity}
            onChange={(e) => {
              setFilterSeverity(e.target.value);
            }}
          >
            <option value="all">All Severities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
            <option value="Safe">Safe</option>
          </select>
        </div>
        <div className="filter-group">
          <label>Language:</label>
          <select
            value={filterLanguage}
            onChange={(e) => setFilterLanguage(e.target.value)}
          >
            <option value="all">All Languages</option>
            {uniqueLanguages.map((lang) => (
              <option key={lang} value={lang}>
                {lang}
              </option>
            ))}
          </select>
        </div>
        <div className="filter-stats">
          Showing {filteredReviews.length} of {reviews.length} reviews
        </div>
      </div>

      <div className="reviews-content">
        <div className="reviews-list">
          {filteredReviews.length === 0 ? (
            <div className="no-reviews">📋 No reviews match your filters</div>
          ) : (
            filteredReviews.map((review) => (
              <div
                key={review._id}
                className="review-card"
                onClick={() => handleViewReview(review._id)}
              >
                <div className="review-card-header">
                  <div className="review-card-title">
                    <span
                      className="severity-indicator"
                      style={{
                        backgroundColor: getSeverityColor(review.severityLevel),
                      }}
                    />
                    <span className="title-text">{review.title}</span>
                  </div>
                  <button
                    className="delete-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteReview(review._id);
                    }}
                  >
                    🗑️
                  </button>
                </div>

                <div className="review-card-meta">
                  <span className="language-badge">{review.language}</span>
                  <span
                    className="severity-badge"
                    style={{
                      backgroundColor: getSeverityColor(review.severityLevel),
                      color: "white",
                    }}
                  >
                    {review.severityLevel}
                  </span>
                  <span className="date-text">
                    {new Date(review.timestamp).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal Backdrop */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={handleBackdropClick}>
          {/* Modal Container */}
          <div className="modal-container">
            {/* Modal Header */}
            <div className="modal-header">
              <div className="modal-header-content">
                <h2 className="modal-title">
                  {selectedReview?.title || "Code Review"}
                </h2>
                <div className="modal-badges">
                  <span
                    className="modal-severity-badge"
                    style={{
                      backgroundColor: getSeverityColor(
                        selectedReview?.severityLevel,
                      ),
                    }}
                  >
                    {selectedReview?.severityLevel || "Medium"}
                  </span>
                  <span className="modal-language-badge">
                    {selectedReview?.language}
                  </span>
                </div>
              </div>
              <button
                className="modal-close-btn"
                onClick={closeModal}
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            {/* Modal Content */}
            <div className="modal-content">
              {selectedReview && <ReviewResult result={selectedReview} />}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
