import React, { useState, useEffect } from 'react';

const ProjectWizard = ({ isOpen, onClose, onComplete }) => {
  const [step, setStep] = useState(1);
  const [projectData, setProjectData] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    contacts: null,
    templates: [],
    invitations: {
      message: '',
      sendDate: '',
    },
    cannedResponses: [],
    messageDispatcher: {
      schedule: '',
      frequency: '',
    },
    agents: [],
    conversations: [],
  });

  useEffect(() => {
    if (isOpen) {
      const wizardWindow = window.open('', 'ProjectWizard', 'width=800,height=600');
      wizardWindow.document.body.innerHTML = '<div id="wizard-root"></div>';
      // Render the wizard content in the new window
      // This would typically be done using ReactDOM.render or a similar method
    }
  }, [isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProjectData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    setProjectData(prevData => ({
      ...prevData,
      contacts: file
    }));
  };

  const addTemplate = () => {
    setProjectData(prevData => ({
      ...prevData,
      templates: [...prevData.templates, { name: '', content: '', variables: [] }]
    }));
  };

  const updateTemplate = (index, field, value) => {
    const updatedTemplates = [...projectData.templates];
    updatedTemplates[index][field] = value;
    setProjectData(prevData => ({
      ...prevData,
      templates: updatedTemplates
    }));
  };

  const addVariableToTemplate = (templateIndex, variable) => {
    const updatedTemplates = [...projectData.templates];
    updatedTemplates[templateIndex].variables.push(variable);
    setProjectData(prevData => ({
      ...prevData,
      templates: updatedTemplates
    }));
  };

  const addCannedResponse = () => {
    setProjectData(prevData => ({
      ...prevData,
      cannedResponses: [...prevData.cannedResponses, { trigger: '', response: '' }]
    }));
  };

  const updateCannedResponse = (index, field, value) => {
    const updatedResponses = [...projectData.cannedResponses];
    updatedResponses[index][field] = value;
    setProjectData(prevData => ({
      ...prevData,
      cannedResponses: updatedResponses
    }));
  };

  const addAgent = () => {
    setProjectData(prevData => ({
      ...prevData,
      agents: [...prevData.agents, { name: '', email: '' }]
    }));
  };

  const updateAgent = (index, field, value) => {
    const updatedAgents = [...projectData.agents];
    updatedAgents[index][field] = value;
    setProjectData(prevData => ({
      ...prevData,
      agents: updatedAgents
    }));
  };

  const removeAgent = (index) => {
    setProjectData(prevData => ({
      ...prevData,
      agents: prevData.agents.filter((_, i) => i !== index)
    }));
  };

  const validateAgents = () => {
    return projectData.agents.every(agent => agent.name.trim() !== '' && agent.email.trim() !== '');
  };

  const nextStep = () => {
    if (step === 7 && !validateAgents()) {
      alert('Please fill in all agent details or remove empty entries.');
      return;
    }
    setStep(step + 1);
  };

  const prevStep = () => setStep(step - 1);

  const handleComplete = () => {
    onComplete(projectData);
    onClose();
  };

  const renderStep = () => {
    switch(step) {
      case 1:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Step 1: Project Setup</h2>
            <input
              type="text"
              name="name"
              value={projectData.name}
              onChange={handleInputChange}
              placeholder="Enter project name"
              className="w-full p-2 border rounded"
            />
            <textarea
              name="description"
              value={projectData.description}
              onChange={handleInputChange}
              placeholder="Enter project description"
              className="w-full p-2 border rounded"
            />
            <div className="flex space-x-4">
              <input
                type="date"
                name="startDate"
                value={projectData.startDate}
                onChange={handleInputChange}
                className="p-2 border rounded"
              />
              <input
                type="date"
                name="endDate"
                value={projectData.endDate}
                onChange={handleInputChange}
                className="p-2 border rounded"
              />
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Step 2: Contacts Upload</h2>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="p-2 border rounded"
            />
            {projectData.contacts && <p>File uploaded: {projectData.contacts.name}</p>}
          </div>
        );
      case 3:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Step 3: Templates</h2>
            {projectData.templates.map((template, index) => (
              <div key={index} className="space-y-2 border p-4 rounded">
                <input
                  type="text"
                  value={template.name}
                  onChange={(e) => updateTemplate(index, 'name', e.target.value)}
                  placeholder="Template name"
                  className="w-full p-2 border rounded"
                />
                <textarea
                  value={template.content}
                  onChange={(e) => updateTemplate(index, 'content', e.target.value)}
                  placeholder="Template content"
                  className="w-full p-2 border rounded"
                />
                <div>
                  <h4 className="font-bold">Variables:</h4>
                  {template.variables.map((variable, varIndex) => (
                    <span key={varIndex} className="mr-2 bg-gray-200 px-2 py-1 rounded">{variable}</span>
                  ))}
                  <input
                    type="text"
                    placeholder="Add variable"
                    className="w-full p-2 border rounded mt-2"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        addVariableToTemplate(index, e.target.value);
                        e.target.value = '';
                      }
                    }}
                  />
                </div>
              </div>
            ))}
            <button onClick={addTemplate} className="bg-blue-500 text-white px-4 py-2 rounded">Add Template</button>
          </div>
        );
      case 4:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Step 4: Invitations</h2>
            <textarea
              name="invitations.message"
              value={projectData.invitations.message}
              onChange={handleInputChange}
              placeholder="Invitation message"
              className="w-full p-2 border rounded"
            />
            <input
              type="date"
              name="invitations.sendDate"
              value={projectData.invitations.sendDate}
              onChange={handleInputChange}
              className="p-2 border rounded"
            />
          </div>
        );
      case 5:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Step 5: Canned Responses</h2>
            {projectData.cannedResponses.map((response, index) => (
              <div key={index} className="space-y-2 border p-4 rounded">
                <input
                  type="text"
                  value={response.trigger}
                  onChange={(e) => updateCannedResponse(index, 'trigger', e.target.value)}
                  placeholder="Trigger word/phrase"
                  className="w-full p-2 border rounded"
                />
                <textarea
                  value={response.response}
                  onChange={(e) => updateCannedResponse(index, 'response', e.target.value)}
                  placeholder="Canned response"
                  className="w-full p-2 border rounded"
                />
              </div>
            ))}
            <button onClick={addCannedResponse} className="bg-blue-500 text-white px-4 py-2 rounded">Add Canned Response</button>
          </div>
        );
      case 6:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Step 6: Message Dispatcher</h2>
            <input
              type="text"
              name="messageDispatcher.schedule"
              value={projectData.messageDispatcher.schedule}
              onChange={handleInputChange}
              placeholder="Dispatch schedule (e.g., daily, weekly)"
              className="w-full p-2 border rounded"
            />
            <input
              type="text"
              name="messageDispatcher.frequency"
              value={projectData.messageDispatcher.frequency}
              onChange={handleInputChange}
              placeholder="Dispatch frequency (e.g., 5 messages per day)"
              className="w-full p-2 border rounded"
            />
          </div>
        );
      case 7:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Step 7: Agents</h2>
            {projectData.agents.map((agent, index) => (
              <div key={index} className="flex space-x-2 items-center">
                <input
                  type="text"
                  value={agent.name}
                  onChange={(e) => updateAgent(index, 'name', e.target.value)}
                  placeholder="Agent name"
                  className="flex-1 p-2 border rounded"
                />
                <input
                  type="email"
                  value={agent.email}
                  onChange={(e) => updateAgent(index, 'email', e.target.value)}
                  placeholder="Agent email"
                  className="flex-1 p-2 border rounded"
                />
                <button onClick={() => removeAgent(index)} className="bg-red-500 text-white px-2 py-1 rounded">Remove</button>
              </div>
            ))}
            <button onClick={addAgent} className="bg-blue-500 text-white px-4 py-2 rounded">Add Agent</button>
          </div>
        );
      case 8:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Step 8: Review</h2>
            <div>
              <h3 className="font-bold">Project Details:</h3>
              <p>Name: {projectData.name}</p>
              <p>Description: {projectData.description}</p>
              <p>Start Date: {projectData.startDate}</p>
              <p>End Date: {projectData.endDate}</p>
            </div>
            <div>
              <h3 className="font-bold">Contacts:</h3>
              <p>{projectData.contacts ? projectData.contacts.name : 'No file uploaded'}</p>
            </div>
            <div>
              <h3 className="font-bold">Templates: {projectData.templates.length}</h3>
            </div>
            <div>
              <h3 className="font-bold">Canned Responses: {projectData.cannedResponses.length}</h3>
            </div>
            <div>
              <h3 className="font-bold">Message Dispatcher:</h3>
              <p>Schedule: {projectData.messageDispatcher.schedule}</p>
              <p>Frequency: {projectData.messageDispatcher.frequency}</p>
            </div>
            <div>
              <h3 className="font-bold">Agents: {projectData.agents.length}</h3>
            </div>
          </div>
        );
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg w-3/4 max-h-screen overflow-y-auto">
        <button onClick={onClose} className="float-right text-gray-500 hover:text-gray-700">Close</button>
        {renderStep()}
        <div className="mt-8 flex justify-between">
          {step > 1 && <button onClick={prevStep} className="bg-gray-300 text-gray-700 px-4 py-2 rounded">Previous</button>}
          {step < 8 ? (
            <button onClick={nextStep} className="bg-blue-500 text-white px-4 py-2 rounded">Next</button>
          ) : (
            <button onClick={handleComplete} className="bg-green-500 text-white px-4 py-2 rounded">Finish</button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectWizard;
