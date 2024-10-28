let token = localStorage.getItem('token');

// Helper function for making authenticated API requests
async function apiRequest(url, method = 'GET', body = null) {
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
    const options = {
        method,
        headers,
        body: body ? JSON.stringify(body) : null
    };
    const response = await fetch(`http://localhost:3000/api${url}`, options);
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
}

// Authentication
document.getElementById('auth-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    try {
        const response = await fetch('http://localhost:3000/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const data = await response.json();
        if (data.token) {
            token = data.token;
            localStorage.setItem('token', token);
            showAuthenticatedSections();
        } else {
            alert('Authentication failed');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Authentication failed');
    }
});

// Projects
document.getElementById('project-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('project-name').value;
    const description = document.getElementById('project-description').value;
    try {
        await apiRequest('/projects', 'POST', { name, description });
        alert('Project created successfully');
        loadProjects();
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to create project');
    }
});

async function loadProjects() {
    try {
        const projects = await apiRequest('/projects');
        const projectList = document.getElementById('project-list');
        projectList.innerHTML = '';
        projects.forEach(project => {
            const div = document.createElement('div');
            div.textContent = `${project.name}: ${project.description}`;
            projectList.appendChild(div);
        });
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to load projects');
    }
}

// Contacts
document.getElementById('contact-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const file = document.getElementById('csv-file').files[0];
    const formData = new FormData();
    formData.append('csv', file);
    try {
        const response = await fetch('http://localhost:3000/api/contacts/upload', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData
        });
        if (response.ok) {
            alert('Contacts uploaded successfully');
        } else {
            throw new Error('Failed to upload contacts');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to upload contacts');
    }
});

// Templates
document.getElementById('template-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('template-name').value;
    const content = document.getElementById('template-content').value;
    try {
        await apiRequest('/templates', 'POST', { name, content });
        alert('Template created successfully');
        loadTemplates();
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to create template');
    }
});

async function loadTemplates() {
    try {
        const templates = await apiRequest('/templates');
        const templateList = document.getElementById('template-list');
        templateList.innerHTML = '';
        templates.forEach(template => {
            const div = document.createElement('div');
            div.textContent = `${template.name}: ${template.content}`;
            templateList.appendChild(div);
        });
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to load templates');
    }
}

// Send Invitations
document.getElementById('invitation-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const projectId = document.getElementById('project-select').value;
    const templateId = document.getElementById('template-select').value;
    try {
        await apiRequest('/send-invitations', 'POST', { projectId, templateId });
        alert('Invitations sent successfully');
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to send invitations');
    }
});

// Analytics
async function loadAnalytics() {
    try {
        const analytics = await apiRequest('/analytics');
        const analyticsData = document.getElementById('analytics-data');
        analyticsData.innerHTML = '';
        analytics.forEach(item => {
            const div = document.createElement('div');
            div.textContent = `${item._id}: ${item.count}`;
            analyticsData.appendChild(div);
        });
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to load analytics');
    }
}

function showAuthenticatedSections() {
    document.getElementById('auth-section').classList.add('hidden');
    document.getElementById('project-section').classList.remove('hidden');
    document.getElementById('contact-section').classList.remove('hidden');
    document.getElementById('template-section').classList.remove('hidden');
    document.getElementById('invitation-section').classList.remove('hidden');
    document.getElementById('analytics-section').classList.remove('hidden');
    loadProjects();
    loadTemplates();
    loadAnalytics();
}

// Check if user is already authenticated
if (token) {
    showAuthenticatedSections();
}