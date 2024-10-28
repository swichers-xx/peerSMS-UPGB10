import React, { useState, useEffect } from 'react';
import Templates from './Templates';
import CannedResponses from './CannedResponses';
import Contacts from './Contacts';
import ProjectWizard from './ProjectWizard';

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [newProject, setNewProject] = useState({ name: '', description: '', agents: [] });
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('details');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const pageSize = 9; // Number of projects per page

  useEffect(() => {
    fetchProjects();
  }, [currentPage, searchQuery]);

  const fetchProjects = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/projects?page=${currentPage}&pageSize=${pageSize}&search=${searchQuery}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        const data = await response.json();
        setProjects(data.data);
        setTotalPages(data.totalPages);
      } else {
        throw new Error('Failed to fetch projects');
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
      setError('Failed to fetch projects. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(newProject)
      });

      if (response.ok) {
        setNewProject({ name: '', description: '', agents: [] });
        fetchProjects();
      } else {
        throw new Error('Failed to create project');
      }
    } catch (error) {
      console.error('Error creating project:', error);
      setError('Failed to create project. Please try again.');
    }
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleWizardComplete = async (projectData) => {
    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(projectData)
      });

      if (response.ok) {
        fetchProjects();
        setIsWizardOpen(false);
      } else {
        throw new Error('Failed to create project');
      }
    } catch (error) {
      console.error('Error creating project:', error);
      setError('Failed to create project. Please try again.');
    }
  };

  const renderProjectDetails = () => {
    if (!selectedProject) return null;

    return (
      <div className="mt-4">
        <h3 className="text-xl font-semibold mb-2">{selectedProject.name}</h3>
        <p>{selectedProject.description}</p>
      </div>
    );
  };

  const renderAgents = () => {
    if (!selectedProject) return null;

    return (
      <div className="mt-4">
        <h3 className="text-xl font-semibold mb-2">Agents</h3>
        {!selectedProject.agents || selectedProject.agents.length === 0 ? (
          <p>No agents assigned to this project.</p>
        ) : (
          <ul>
            {selectedProject.agents.map((agent, index) => (
              <li key={index} className="mb-2">
                <strong>{agent.name}</strong> - {agent.email}
              </li>
            ))}
          </ul>
        )}
        <button
          onClick={() => {/* Add logic to add new agent */}}
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
        >
          Add New Agent
        </button>
      </div>
    );
  };

  const renderTabContent = () => {
    if (!selectedProject) return null;

    switch (activeTab) {
      case 'details':
        return renderProjectDetails();
      case 'templates':
        return <Templates projectId={selectedProject._id} />;
      case 'cannedResponses':
        return <CannedResponses projectId={selectedProject._id} />;
      case 'contacts':
        return <Contacts projectId={selectedProject._id} />;
      case 'agents':
        return renderAgents();
      default:
        return null;
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
        <h2 className="text-xl font-semibold mb-4">Create New Project</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <button
          onClick={() => setIsWizardOpen(true)}
          className="bg-green-500 text-white px-4 py-2 rounded mb-4"
        >
          Open Project Wizard
        </button>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block mb-1">Project Name:</label>
            <input
              type="text"
              id="name"
              value={newProject.name}
              onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>
          <div>
            <label htmlFor="description" className="block mb-1">Description:</label>
            <textarea
              id="description"
              value={newProject.description}
              onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
              className="w-full border rounded px-3 py-2"
              rows="3"
            ></textarea>
          </div>
          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">Create Project</button>
        </form>
      </div>

      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Your Projects</h2>
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={handleSearch}
            className="w-full border rounded px-3 py-2"
          />
        </div>
        {isLoading ? (
          <p>Loading projects...</p>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.map(project => (
                <div
                  key={project._id}
                  className={`p-4 border rounded cursor-pointer ${selectedProject?._id === project._id ? 'bg-blue-100' : ''}`}
                  onClick={() => setSelectedProject(project)}
                >
                  <h3 className="font-semibold">{project.name}</h3>
                  <p className="text-sm text-gray-600">{project.description}</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Agents: {project.agents ? project.agents.length : 0}
                  </p>
                </div>
              ))}
            </div>
            {renderPagination()}
          </>
        )}
      </div>

      {selectedProject && (
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Project Details</h2>
          <div className="mb-4">
            <button
              className={`mr-2 px-3 py-1 rounded ${activeTab === 'details' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
              onClick={() => setActiveTab('details')}
            >
              Details
            </button>
            <button
              className={`mr-2 px-3 py-1 rounded ${activeTab === 'templates' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
              onClick={() => setActiveTab('templates')}
            >
              Templates
            </button>
            <button
              className={`mr-2 px-3 py-1 rounded ${activeTab === 'cannedResponses' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
              onClick={() => setActiveTab('cannedResponses')}
            >
              Canned Responses
            </button>
            <button
              className={`mr-2 px-3 py-1 rounded ${activeTab === 'contacts' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
              onClick={() => setActiveTab('contacts')}
            >
              Contacts
            </button>
            <button
              className={`px-3 py-1 rounded ${activeTab === 'agents' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
              onClick={() => setActiveTab('agents')}
            >
              Agents
            </button>
          </div>
          {renderTabContent()}
        </div>
      )}

      <ProjectWizard
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        onComplete={handleWizardComplete}
      />
    </div>
  );
}
