import React, { useState } from 'react';
import Papa from 'papaparse';

const CSVUploader = ({ onUpload }) => {
  const [preview, setPreview] = useState('');

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    Papa.parse(file, {
      complete: function(results) {
        const contacts = results.data.slice(1); // Assume first row is header
        const preview = results.data.slice(0, 5).map(row => row.join(', ')).join('\n');
        setPreview(preview);
        onUpload(contacts);
      }
    });
  };

  return (
    <div className="section">
      <div className="section-header">CSV Upload</div>
      <div className="section-content">
        <label htmlFor="csvUpload" className="file-label">
          <i className="fas fa-file-csv"></i> Choose CSV File
        </label>
        <input
          type="file"
          id="csvUpload"
          accept=".csv"
          className="file-input"
          onChange={handleFileUpload}
        />
        {preview && (
          <div id="csvPreview">
            <h3>CSV Preview (first 5 rows):</h3>
            <pre>{preview}</pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default CSVUploader;
