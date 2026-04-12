import react from 'react';
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function ReviewHistory({onSelectReview}) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async ()=>{
    try{
        const response = await axios.get('http://localhost:3001/review/history');
        setHistory(response.data);
    }catch(error){
        console.error('Failed to fetch history', error);
    }finally{
        setLoading(false);
    }
  }

  const handleViewReview = async(id)=>{
    try{
        const response = await axios.get(`http://localhost:3001/review/${id}`);
        onSelectReview(response.data);
    }catch(error){
        console.error('Failed to review history',error)
    }
  };

  if(loading){
     return <div className="history-loading">Loading history...</div>;
  }
  if (history.length === 0) {
    return <div className="history-empty">No reviews yet. Submit some code to get started!</div>;
  }

  return (
      <div className="review-history">
      <h3>Review History ({history.length})</h3>
      <div className="history-list">
        {history.map((item) => (
          <div 
            key={item._id} 
            className="history-item"
            onClick={() => handleViewReview(item._id)}
          >
            <div className="history-language">{item.language}</div>
            <div className="history-filename">{item.fileName || 'Code snippet'}</div>
            <div className="history-date">
              {new Date(item.timestamp).toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 