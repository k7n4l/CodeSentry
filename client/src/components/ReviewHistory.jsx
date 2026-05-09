import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function ReviewHistory({ onSelectReview }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();

    const handleRefresh = () => fetchHistory();

    window.addEventListener('refreshHistory', handleRefresh);

    return () =>
      window.removeEventListener('refreshHistory', handleRefresh);
  }, []);

  const token = localStorage.getItem("token");

  const fetchHistory = async () => {
    try {
      const response = await axios.get(
        'http://localhost:3001/review/history',
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setHistory(response.data);

    } catch (error) {
      console.error('Failed to fetch history:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewReview = async (id) => {
    try {
      const response = await axios.get(
        `http://localhost:3001/review/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      onSelectReview(response.data);

    } catch (error) {
      console.error('Failed to fetch review:', error);
    }
  };

  const getSeverityColor = (severity) => {
    const colors = {
      Critical: '#e74c3c',
      High: '#e67e22',
      Medium: '#f39c12',
      Low: '#3498db',
      Safe: '#27ae60'
    };

    return colors[severity] || '#95a5a6';
  };

  if (loading) {
    return <div>⏳ Loading history...</div>;
  }

  if (history.length === 0) {
    return <div>📋 No reviews yet.</div>;
  }

  return (
    <div className="review-history">
      <h3>📚 Review History ({history.length})</h3>

      <div className="history-list">
        {history.map((item) => (
          <div
            key={item._id}
            className="history-item"
            onClick={() => handleViewReview(item._id)}
          >
            <div className="history-header">
              <span
                className="severity-dot"
                style={{
                  backgroundColor: getSeverityColor(
                    item.severityLevel
                  )
                }}
              />

              <span className="history-title">
                {item.title}
              </span>
            </div>

            <div className="history-meta">
              <span>{item.language}</span>

              <span>
                {new Date(item.timestamp).toLocaleDateString()}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}