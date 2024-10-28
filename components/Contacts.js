import { useState, useEffect, useCallback } from 'react';

export default function Contacts({ projectId, onContactsSelected }) {
  const [contacts, setContacts] = useState([]);
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [successMessage, setSuccessMessage] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [uploadMode, setUploadMode] = useState('simple'); // 'simple' or 'advanced'
  const pageSize = 10; // Number of contacts per page

  const fetchContacts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/contacts?projectId=${projectId}&page=${currentPage}&pageSize=${pageSize}&search=${searchQuery}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        const data = await response.json();
        setContacts(data.data);
        setTotalPages(data.totalPages);
      } else {
        throw new Error('Failed to fetch contacts');
      }
    } catch (error) {
      console.error('Error fetching contacts:', error);
      setError('Failed to fetch contacts. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [projectId, currentPage, searchQuery]);

  useEffect(() => {
    if (projectId) {
      fetchContacts();
    }
  }, [projectId, fetchContacts]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type !== 'text/csv') {
      setError('Please upload a valid CSV file.');
      setFile(null);
    } else {
      setFile(selectedFile);
      setError(null);
    }
    setSuccessMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file');
      return;
    }

    setIsUploading(true);
    setError(null);
    setSuccessMessage('');
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('csv', file);
    formData.append('projectId', projectId);
    formData.append('uploadMode', uploadMode);

    try {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', '/api/contacts', true);
      xhr.setRequestHeader('Authorization', `Bearer ${localStorage.getItem('token')}`);

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = (event.loaded / event.total) * 100;
          setUploadProgress(percentComplete);
        }
      };

      xhr.onload = async () => {
        if (xhr.status === 201) {
          const result = JSON.parse(xhr.responseText);
          setSuccessMessage(result.message);
          setFile(null);
          setCurrentPage(1);
          await fetchContacts();
        } else {
          throw new Error(JSON.parse(xhr.responseText).message || 'Failed to upload contacts');
        }
      };

      xhr.onerror = () => {
        throw new Error('Network error occurred while uploading contacts');
      };

      xhr.send(formData);
    } catch (error) {
      console.error('Error:', error);
      setError(`Failed to upload contacts: ${error.message}`);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleContactSelection = (contact) => {
    setSelectedContacts(prev => {
      const isSelected = prev.some(c => c._id === contact._id);
      if (isSelected) {
        return prev.filter(c => c._id !== contact._id);
      } else {
        return [...prev, contact];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedContacts.length === contacts.length) {
      setSelectedContacts([]);
    } else {
      setSelectedContacts([...contacts]);
    }
  };

  useEffect(() => {
    onContactsSelected(selectedContacts);
  }, [selectedContacts, onContactsSelected]);

  const renderPagination = () => {
    return (
      <div className="flex justify-center mt-4">
        <button
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="px-3 py-1 bg-blue-500 text-white rounded mr-2 disabled:bg-gray-300"
          aria-label="Previous page"
        >
          Previous
        </button>
        <span className="px-3 py-1">
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="px-3 py-1 bg-blue-500 text-white rounded ml-2 disabled:bg-gray-300"
          aria-label="Next page"
        >
          Next
        </button>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Upload Contacts</h2>
        <div className="mb-4">
          <button
            onClick={() => setUploadMode('simple')}
            className={`mr-2 px-3 py-1 rounded ${uploadMode === 'simple' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            Simple Upload
          </button>
          <button
            onClick={() => setUploadMode('advanced')}
            className={`px-3 py-1 rounded ${uploadMode === 'advanced' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            Add Contacts - Advanced
          </button>
        </div>
        {error && <p className="text-red-500 mb-4" role="alert">{error}</p>}
        {successMessage && <p className="text-green-500 mb-4" role="status">{successMessage}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="csv-file" className="block mb-2">Upload CSV File:</label>
            <input
              type="file"
              id="csv-file"
              accept=".csv"
              onChange={handleFileChange}
              className="input"
              required
              aria-describedby="file-format-info"
            />
            <p id="file-format-info" className="text-sm text-gray-600 mt-1">
              {uploadMode === 'simple' 
                ? 'Please upload a CSV file with headers: name, phone, link, pin, var1, var2, var3. Only name, phone, and link are required.'
                : 'Please upload a CSV file with headers: name, phone, and any additional fields.'}
            </p>
          </div>
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={!file || isUploading}
          >
            {isUploading ? 'Uploading...' : 'Upload Contacts'}
          </button>
          {isUploading && (
            <div className="mt-2">
              <div className="bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full" 
                  style={{width: `${uploadProgress}%`}}
                  role="progressbar"
                  aria-valuenow={uploadProgress}
                  aria-valuemin="0"
                  aria-valuemax="100"
                ></div>
              </div>
              <p className="text-sm text-gray-600 mt-1">{Math.round(uploadProgress)}% uploaded</p>
            </div>
          )}
        </form>
      </div>

      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Your Contacts</h2>
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search contacts..."
            value={searchQuery}
            onChange={handleSearch}
            className="w-full border rounded px-3 py-2"
            aria-label="Search contacts"
          />
        </div>
        {isLoading ? (
          <p role="status">Loading contacts...</p>
        ) : contacts.length === 0 ? (
          <p>No contacts found. Try a different search or upload a CSV file to get started!</p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-4 py-2 text-left">
                      <input
                        type="checkbox"
                        checked={selectedContacts.length === contacts.length}
                        onChange={handleSelectAll}
                        aria-label="Select all contacts"
                      />
                    </th>
                    <th className="px-4 py-2 text-left">Name</th>
                    <th className="px-4 py-2 text-left">Phone</th>
                    <th className="px-4 py-2 text-left">Link</th>
                    <th className="px-4 py-2 text-left">Additional Fields</th>
                  </tr>
                </thead>
                <tbody>
                  {contacts.map((contact) => (
                    <tr key={contact._id} className="border-b">
                      <td className="px-4 py-2">
                        <input
                          type="checkbox"
                          checked={selectedContacts.some(c => c._id === contact._id)}
                          onChange={() => handleContactSelection(contact)}
                          aria-label={`Select ${contact.name}`}
                        />
                      </td>
                      <td className="px-4 py-2">{contact.name}</td>
                      <td className="px-4 py-2">{contact.phone}</td>
                      <td className="px-4 py-2">{contact.link}</td>
                      <td className="px-4 py-2">
                        {Object.entries(contact.additionalFields || {}).map(([key, value]) => (
                          <div key={key}>{`${key}: ${value}`}</div>
                        ))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {renderPagination()}
          </>
        )}
      </div>
    </div>
  );
}
