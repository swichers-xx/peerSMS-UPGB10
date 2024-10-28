import { useState, useEffect } from 'react';

export default function Invitations() {
  // ... (keep existing state variables)
  const [useVoxcoApi, setUseVoxcoApi] = useState(false);
  const [failedInvitations, setFailedInvitations] = useState([]);

  // ... (keep existing useEffect hooks and functions)

  const handleSendInvitations = async () => {
    setError(null);
    setSuccess(null);
    setFailedInvitations([]);
    setIsLoading(true);

    if (generatedInvitations.length === 0) {
      setError('No invitations to send. Please generate invitations first.');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/send-invitations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          projectId: selectedProject,
          invitations: generatedInvitations,
          useVoxcoApi: useVoxcoApi
        })
      });

      if (response.ok) {
        const data = await response.json();
        setSuccess(`Successfully sent ${data.data.successful.length} invitations.`);
        if (data.data.failed.length > 0) {
          setFailedInvitations(data.data.failed);
        }
        setSelectedProject('');
        setSelectedTemplate('');
        setSelectedContacts([]);
        setGeneratedInvitations([]);
      } else {
        throw new Error('Failed to send invitations');
      }
    } catch (error) {
      console.error('Error sending invitations:', error);
      setError('Failed to send invitations. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // ... (keep other existing functions)

  return (
    <div className="space-y-6">
      {/* ... (keep existing JSX) */}
      
      {generatedInvitations.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Generated Invitations</h3>
          <div className="space-y-4">
            {/* ... (keep existing generated invitations display) */}
          </div>
          <div className="mt-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={useVoxcoApi}
                onChange={(e) => setUseVoxcoApi(e.target.checked)}
                className="mr-2"
              />
              Use Voxco API for sending invitations
            </label>
          </div>
          <button
            onClick={handleSendInvitations}
            className="bg-green-500 text-white px-4 py-2 rounded mt-4"
            disabled={isLoading}
          >
            {isLoading ? 'Sending...' : 'Send Invitations'}
          </button>
        </div>
      )}

      {failedInvitations.length > 0 && (
        <div className="card bg-red-100 border-red-300">
          <h3 className="text-lg font-semibold mb-4">Failed Invitations</h3>
          <ul className="list-disc pl-5">
            {failedInvitations.map((inv, index) => (
              <li key={index} className="text-red-700">
                {inv.contact.name}: {inv.error}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
