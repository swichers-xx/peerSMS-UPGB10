import React, { useState, useEffect } from 'react';

export default function MessageDispatcher({ project, conversation, agent, onSend, disabled }) {
  const [message, setMessage] = useState('');
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [cannedResponses, setCannedResponses] = useState([]);
  const [previewMessage, setPreviewMessage] = useState('');
  const [isInvitation, setIsInvitation] = useState(false);
  const [scheduledFor, setScheduledFor] = useState('');

  useEffect(() => {
    fetchTemplates();
    fetchCannedResponses();
  }, [project]);

  useEffect(() => {
    if (selectedTemplate && conversation) {
      const preview = generatePreview(selectedTemplate, conversation.contact);
      setPreviewMessage(preview);
    }
  }, [selectedTemplate, conversation]);

  const fetchTemplates = async () => {
    if (!project) return;
    try {
      const response = await fetch(`/api/templates?projectId=${project._id}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        const data = await response.json();
        setTemplates(data.data);
      } else {
        throw new Error('Failed to fetch templates');
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  };

  const fetchCannedResponses = async () => {
    if (!project) return;
    try {
      const response = await fetch(`/api/canned-responses?projectId=${project._id}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        const data = await response.json();
        setCannedResponses(data.data);
      } else {
        throw new Error('Failed to fetch canned responses');
      }
    } catch (error) {
      console.error('Error fetching canned responses:', error);
    }
  };

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
    setMessage(template.content);
    setIsInvitation(true);
  };

  const handleCannedResponseSelect = (response) => {
    setMessage(response.content);
    setIsInvitation(false);
  };

  const generatePreview = (template, contact) => {
    let preview = template.content;
    template.variables.forEach(variable => {
      preview = preview.replace(`{{${variable}}}`, contact[variable] || '');
    });
    return preview;
  };

  const handleSend = () => {
    if (message.trim() || previewMessage) {
      onSend(previewMessage || message, scheduledFor, isInvitation);
      setMessage('');
      setSelectedTemplate(null);
      setPreviewMessage('');
      setIsInvitation(false);
      setScheduledFor('');
    }
  };

  return (
    <div className="p-4 border-t">
      <div className="mb-4">
        <select
          className="w-full p-2 border rounded"
          onChange={(e) => handleTemplateSelect(templates.find(t => t._id === e.target.value))}
          value={selectedTemplate?._id || ''}
          disabled={disabled}
        >
          <option value="">Select a template</option>
          {templates.map(template => (
            <option key={template._id} value={template._id}>{template.name}</option>
          ))}
        </select>
      </div>
      <div className="mb-4">
        <select
          className="w-full p-2 border rounded"
          onChange={(e) => handleCannedResponseSelect(cannedResponses.find(r => r._id === e.target.value))}
          disabled={disabled}
        >
          <option value="">Select a canned response</option>
          {cannedResponses.map(response => (
            <option key={response._id} value={response._id}>{response.title}</option>
          ))}
        </select>
      </div>
      <textarea
        className="w-full p-2 border rounded mb-4"
        rows="4"
        value={message}
        onChange={(e) => {
          setMessage(e.target.value);
          setPreviewMessage('');
          setIsInvitation(false);
        }}
        placeholder="Type your message here..."
        disabled={disabled}
      ></textarea>
      {previewMessage && (
        <div className="mb-4">
          <h3 className="font-bold">Preview:</h3>
          <pre className="p-2 bg-gray-100 rounded">{previewMessage}</pre>
        </div>
      )}
      <div className="mb-4">
        <label className="block mb-2">Schedule Message:</label>
        <input
          type="datetime-local"
          className="w-full p-2 border rounded"
          value={scheduledFor}
          onChange={(e) => setScheduledFor(e.target.value)}
          disabled={disabled}
        />
      </div>
      <div className="mb-4">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={isInvitation}
            onChange={(e) => setIsInvitation(e.target.checked)}
            disabled={disabled}
            className="mr-2"
          />
          Send as Invitation
        </label>
      </div>
      <button
        className={`w-full p-2 rounded ${disabled ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'} text-white`}
        onClick={handleSend}
        disabled={disabled || (!message.trim() && !previewMessage)}
      >
        {scheduledFor ? 'Schedule Message' : 'Send Message'}
      </button>
      {agent && (
        <div className="mt-2 text-sm text-gray-600">
          Sending as: {agent.name}
        </div>
      )}
    </div>
  );
}
