import React, { useState, useEffect } from 'react';
import MessageDispatcher from './MessageDispatcher';
import Analytics from './Analytics';

export default function Inbox() {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [error, setError] = useState(null);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const pageSize = 20; // Number of messages per page

  useEffect(() => {
    fetchProjects();
    setupSSE();

    return () => {
      if (global.eventSource) {
        global.eventSource.close();
      }
    };
  }, []);

  useEffect(() => {
    if (selectedProject) {
      fetchConversations();
      setSelectedAgent(selectedProject.agents[0]);
    }
  }, [selectedProject]);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages();
    }
  }, [selectedConversation, currentPage]);

  const setupSSE = () => {
    if (typeof EventSource !== 'undefined' && !global.eventSource) {
      global.eventSource = new EventSource('/api/sse');
      global.eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'newMessage') {
          updateConversationWithNewMessage(data.message);
        }
      };
    } else if (typeof EventSource === 'undefined') {
      console.warn('EventSource is not supported in this environment. Real-time updates will not be available.');
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/projects', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        const data = await response.json();
        setProjects(data.data);
      } else {
        throw new Error('Failed to fetch projects');
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
      setError('Failed to fetch projects. Please try again.');
    }
  };

  const fetchConversations = async () => {
    if (!selectedProject) return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/conversations?projectId=${selectedProject._id}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        const data = await response.json();
        setConversations(data.data);
      } else {
        throw new Error('Failed to fetch conversations');
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
      setError('Failed to fetch conversations. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMessages = async () => {
    if (!selectedConversation) return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/messages?conversationId=${selectedConversation._id}&page=${currentPage}&pageSize=${pageSize}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        const data = await response.json();
        setSelectedConversation(prev => ({ ...prev, messages: data.data }));
        setTotalPages(data.totalPages);
      } else {
        throw new Error('Failed to fetch messages');
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      setError('Failed to fetch messages. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async (content, scheduledFor, isInvitation = false) => {
    if (!selectedConversation) return;

    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          conversationId: selectedConversation._id,
          content,
          scheduledFor,
          isInvitation,
          agentId: selectedAgent._id
        })
      });

      if (response.ok) {
        const data = await response.json();
        updateConversationWithNewMessage(data.data);
      } else {
        throw new Error('Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message. Please try again.');
    }
  };

  const updateConversationWithNewMessage = (newMessage) => {
    setConversations(prevConversations => 
      prevConversations.map(conv => 
        conv._id === newMessage.conversationId
          ? { ...conv, lastMessage: newMessage }
          : conv
      )
    );

    if (selectedConversation && selectedConversation._id === newMessage.conversationId) {
      setSelectedConversation(prev => ({
        ...prev,
        messages: [newMessage, ...(prev.messages || [])]
      }));
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
    <div className="flex flex-col h-screen">
      <div className="flex-1 flex">
        <div className="w-1/5 border-r overflow-y-auto">
          <h2 className="text-xl font-semibold p-4">Projects</h2>
          <ul>
            {projects.map(project => (
              <li
                key={project._id}
                className={`p-4 cursor-pointer ${selectedProject?._id === project._id ? 'bg-gray-200' : ''}`}
                onClick={() => {
                  setSelectedProject(project);
                  setSelectedConversation(null);
                  setCurrentPage(1);
                }}
              >
                {project.name}
              </li>
            ))}
          </ul>
        </div>
        <div className="w-1/5 border-r overflow-y-auto">
          <h2 className="text-xl font-semibold p-4">Conversations</h2>
          <ul>
            {conversations.map(conversation => (
              <li
                key={conversation._id}
                className={`p-4 cursor-pointer ${selectedConversation?._id === conversation._id ? 'bg-gray-200' : ''}`}
                onClick={() => {
                  setSelectedConversation(conversation);
                  setCurrentPage(1);
                }}
              >
                {conversation.contact.name}
                <p className="text-sm text-gray-500">{conversation.lastMessage?.content}</p>
              </li>
            ))}
          </ul>
        </div>
        <div className="w-3/5 flex flex-col">
          {selectedConversation ? (
            <>
              <div className="p-4 bg-gray-100 flex justify-between items-center">
                <h3 className="font-semibold">{selectedConversation.contact.name}</h3>
                <select
                  value={selectedAgent?._id}
                  onChange={(e) => setSelectedAgent(selectedProject.agents.find(agent => agent._id === e.target.value))}
                  className="p-2 border rounded"
                >
                  {selectedProject?.agents.map(agent => (
                    <option key={agent._id} value={agent._id}>{agent.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                {isLoading ? (
                  <p>Loading messages...</p>
                ) : selectedConversation.messages?.length === 0 ? (
                  <p>No messages yet.</p>
                ) : (
                  <>
                    {selectedConversation.messages?.map(message => (
                      <div key={message._id} className={`mb-4 ${message.type === 'outgoing' ? 'text-right' : 'text-left'}`}>
                        <div className={`inline-block p-2 rounded ${message.type === 'outgoing' ? 'bg-blue-500 text-white' : 'bg-gray-300'}`}>
                          {message.isInvitation && <span className="font-bold">[Invitation] </span>}
                          {message.content}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {new Date(message.createdAt).toLocaleString()} - {message.status}
                          {message.agent && <span> - Sent by: {message.agent.name}</span>}
                        </div>
                      </div>
                    ))}
                    {renderPagination()}
                  </>
                )}
              </div>
              <MessageDispatcher
                project={selectedProject}
                conversation={selectedConversation}
                agent={selectedAgent}
                onSend={sendMessage}
                disabled={selectedConversation.contact.optedOut}
              />
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              Select a conversation to start messaging
            </div>
          )}
        </div>
      </div>
      <div className="p-4 border-t">
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded"
          onClick={() => setShowAnalytics(!showAnalytics)}
        >
          {showAnalytics ? 'Hide Analytics' : 'Show Analytics'}
        </button>
      </div>
      {showAnalytics && (
        <div className="p-4 border-t">
          <Analytics project={selectedProject} />
        </div>
      )}
      {error && (
        <div className="absolute bottom-0 right-0 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}
    </div>
  );
}
