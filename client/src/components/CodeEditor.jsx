import { useState } from 'react';
import axios from 'axios';

export default function CodeEditor({ onReviewComplete }) {
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!code.trim()) {
      alert('Please enter some code to review');
      return;
    }

    setLoading(true);
    
    try {
      const response = await axios.post('http://localhost:3001/review', {
        code,
        language
      });
      
      onReviewComplete(response.data);
    } catch (error) {
      console.error('Review failed:', error);
      alert('Failed to review code. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="code-editor">
      <h2>CodeSentry - Security Code Review</h2>
      
      <form onSubmit={handleSubmit}>
        <div>
          <label>Language:</label>
          <select value={language} onChange={(e) => setLanguage(e.target.value)}>
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="java">Java</option>
            <option value="php">PHP</option>
            <option value="sql">SQL</option>
          </select>
        </div>

        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Paste your code here for security review..."
          rows={15}
          disabled={loading}
        />

        <button type="submit" disabled={loading}>
          {loading ? 'Analyzing...' : 'Review Code'}
        </button>
      </form>
    </div>
  );
}