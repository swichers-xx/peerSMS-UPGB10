import { useState, useEffect } from 'react';

export default function CannedResponses({ projectId }) {
  const [cannedResponses, setCannedResponses] = useState([]);
  const [newResponse, setNewResponse] = useState({ title: '', content: '' });
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 10; // Number of canned responses per page

  useEffect(() => {
    if (projectId) {
      fetchCannedResponses();
    }
  }, [projectId, currentPage]);

  const fetchCannedResponses = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/canned-responses?projectId=${projectId}&page=${currentPage}&pageSize=${pageSize}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        const data = await response.json();
        setCannedResponses(data.data);
        setTotalPages(data.totalPages);
      } else {
        throw new Error('Failed to fetch canned responses');
      }
    } catch (error) {
      console.error('Error fetching canned responses:', error);
      setError('Failed to fetch canned responses. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const response = await fetch('/api/canned-responses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ ...newResponse, projectId })
      });

      if (response.ok) {
        setNewResponse({ title: '', content: '' });
        setCurrentPage(1); // Reset to first page after creating new response
        fetchCannedResponses();
      } else {
        throw new Error('Failed to create canned response');
      }
    } catch (error) {
      console.error('Error creating canned response:', error);
      setError('Failed to create canned response. Please try again.');
    }
  };

  const renderPagination = () => {
    return (
      <div className="flex justify-center mt-4">
        <button
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="px-3 py-1 bg-blue-500 text-white rounded mr-2 disabled:bg-gray-300"
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
        >
          Next
        </button>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Create New Canned Response</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="block mb-1">Title:</label>
            <input
              type="text"
              id="title"
              value={newResponse.title}
              onChange={(e) => setNewResponse({ ...newResponse, title: e.target.value })}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>
          <div>
            <label htmlFor="content" className="block mb-1">Content:</label>
            <textarea
              id="content"
              value={newResponse.content}
              onChange={(e) => setNewResponse({ ...newResponse, content: e.target.value })}
              className="w-full border rounded px-3 py-2"
              rows="3"
              required
            ></textarea>
          </div>
          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">Create Canned Response</button>
        </form>
      </div>

      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Your Canned Responses</h2>
        {isLoading ? (
          <p>Loading canned responses...</p>
        ) : cannedResponses.length === 0 ? (
          <p>No canned responses yet. Create one to get started!</p>
        ) : (
          <>
            <ul className="space-y-4">
              {cannedResponses.map(response => (
                <li key={response._id} className="border p-4 rounded">
                  <h3 className="font-semibold">{response.title}</h3>
                  <p>{response.content}</p>
                </li>
              ))}
            </ul>
            {renderPagination()}
          </>
        )}
      </div>
    </div>
  );
}
