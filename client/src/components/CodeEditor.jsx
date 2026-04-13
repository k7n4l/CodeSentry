import { useState } from 'react';
import axios from 'axios';

export default function CodeEditor({ onReviewComplete }) {
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [loading, setLoading] = useState(false);
  const [uploadMode,setUploadMode] =useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file){
      setSelectedFile(file);
      const ext = file.name.split('.').pop().toLowerCase();
      const LangMap = {
        'js': 'javascript',
        'py': 'python',
        'java': 'java',
        'php': 'php',
        'sql': 'sql',
        'c': 'c',
        'cpp': 'cpp',
        'go': 'go',
        'rs': 'rust'
      };
      if(LangMap[ext]){
        setLanguage(LangMap[ext]);
      }
    }
  }
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if(uploadMode && !selectedFile){
      alert('Please select a file to upload')
      return
    }
    if(!uploadMode && !code){
      alert('Please enter some code to review')
      return
    }

    setLoading(true);
    
    try {
      let response;
      if(uploadMode){
        const formData = new FormData();
        formData.append('file',selectedFile);
        formData.append('language',language);

        response = await axios.post('http://localhost:3001/upload',formData,{
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
      }
      else{
      response = await axios.post('http://localhost:3001/review', {
        code,
        language
      });
    }
      onReviewComplete(response.data);
    } catch (error) {
      console.error('Review failed:', error);
      alert(error.response?.data?.error||'Failed to review code. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="code-editor">
      <div className="editor-header">
        <h2>Submit Code for Review</h2>
        <div className="mode-toggle">
          <button 
            className={!uploadMode ? 'active' : ''} 
            onClick={() => setUploadMode(false)}
          >
            📝 Paste Code
          </button>
          <button 
            className={uploadMode ? 'active' : ''} 
            onClick={() => setUploadMode(true)}
          >
            📁 Upload File
          </button>
        </div>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Language:</label>
          <select value={language} onChange={(e) => setLanguage(e.target.value)}>
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="java">Java</option>
            <option value="php">PHP</option>
            <option value="sql">SQL</option>
            <option value="c">C</option>
            <option value="cpp">C++</option>
            <option value="go">Go</option>
            <option value="rust">Rust</option>
            <option value="other">Other</option>
          </select>
        </div>

        {uploadMode ? (
          <div className="upload-area">
            <input
              type="file"
              id="file-upload"
              onChange={handleFileChange}
              accept=".js,.py,.java,.php,.sql,.c,.cpp,.go,.rs,.txt"
              disabled={loading}
            />
            <label htmlFor="file-upload" className="upload-label">
              {selectedFile ? (
                <span>✅ {selectedFile.name}</span>
              ) : (
                <span>📁 Click to select file or drag & drop</span>
              )}
            </label>
          </div>
        ) : (
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Paste your code here for security review..."
            rows={15}
            disabled={loading}
          />
        )}

        <button type="submit" disabled={loading} className="submit-btn">
          {loading ? '🔍 Analyzing...' : '🛡️ Review Code'}
        </button>
      </form>
    </div>
  );
}