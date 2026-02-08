import React, { useState } from 'react';
import axios from 'axios';
import { FaCloudUploadAlt, FaSpinner, FaCheckCircle } from 'react-icons/fa';

const FileUpload = ({ onUploadComplete, sessionData }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setError('Please upload a valid PDF file.');
      return;
    }

    setIsUploading(true);
    setError('');

    const formData = new FormData();
    formData.append('file', file);
    if (sessionData && sessionData.session_id) {
      formData.append('session_id', sessionData.session_id);
    }

    try {
      const response = await axios.post('http://localhost:8000/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      onUploadComplete(response.data);
    } catch (err) {
      setError('Upload failed. Please ensure the backend is running.');
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="glass-panel" style={{ textAlign: 'center', margin: '2rem 0' }}>
      <h2>Upload Your Study Material</h2>
      <p style={{ opacity: 0.8, marginBottom: '2rem' }}>
        Upload a PDF to get started. The AI will read it and help you prepare.
      </p>

      <div style={{ position: 'relative', width: '100%', maxWidth: '400px', margin: '0 auto' }}>
        <input
          type="file"
          accept=".pdf"
          onChange={handleFileChange}
          disabled={isUploading}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            opacity: 0,
            cursor: 'pointer',
          }}
          id="file-upload"
        />
        <label
          htmlFor="file-upload"
          className="glass-panel"
          style={{
            display: 'block',
            border: '2px dashed var(--accent-color)',
            background: 'rgba(255,255,255,0.05)',
            cursor: 'pointer',
            padding: '3rem',
          }}
        >
          {isUploading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
              <FaSpinner className="spinner" size={40} style={{ animation: 'spin 1s linear infinite' }} />
              <span>Processing PDF...</span>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
              <FaCloudUploadAlt size={50} color="var(--accent-color)" />
              <span style={{ fontWeight: 600 }}>Click or Drag PDF Here</span>
            </div>
          )}
        </label>
      </div>

      {error && <p style={{ color: '#ff6b6b', marginTop: '1rem' }}>{error}</p>}

      <style>{`
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default FileUpload;
