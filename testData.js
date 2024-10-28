// testData.js

const users = [
  {
    username: 'testuser1',
    password: 'password123',
    email: 'testuser1@example.com',
    preferences: {
      theme: 'light',
      language: 'en',
    },
  },
  {
    username: 'testuser2',
    password: 'password456',
    email: 'testuser2@example.com',
    preferences: {
      theme: 'dark',
      language: 'es',
    },
  },
];

const projects = [
  {
    name: 'Customer Satisfaction Survey',
    description: 'A survey to gauge customer satisfaction with our products',
    owner: 'testuser1',
    status: 'active',
  },
  {
    name: 'Employee Feedback',
    description: 'Annual employee feedback collection',
    owner: 'testuser2',
    status: 'draft',
  },
];

const contacts = [
  {
    name: 'John Doe',
    phoneNumber: '+1234567890',
    email: 'john.doe@example.com',
    projectId: 'Customer Satisfaction Survey',
  },
  {
    name: 'Jane Smith',
    phoneNumber: '+1987654321',
    email: 'jane.smith@example.com',
    projectId: 'Employee Feedback',
  },
];

const templates = [
  {
    name: 'Customer Survey Invitation',
    content: 'Dear {name}, we value your opinion. Please take our quick survey: {surveyLink}',
    projectId: 'Customer Satisfaction Survey',
  },
  {
    name: 'Employee Feedback Request',
    content: 'Hello {name}, it\'s time for our annual feedback. Please share your thoughts here: {feedbackLink}',
    projectId: 'Employee Feedback',
  },
];

const cannedResponses = [
  {
    name: 'Thank You',
    content: 'Thank you for your response. We appreciate your feedback!',
    projectId: 'Customer Satisfaction Survey',
  },
  {
    name: 'Reminder',
    content: 'This is a friendly reminder to complete the survey. Your input is valuable to us.',
    projectId: 'Employee Feedback',
  },
];

const messages = [
  {
    sender: 'system',
    recipient: '+1234567890',
    content: 'Dear John Doe, we value your opinion. Please take our quick survey: https://example.com/survey',
    status: 'sent',
    projectId: 'Customer Satisfaction Survey',
  },
  {
    sender: '+1234567890',
    recipient: 'system',
    content: 'I\'ve completed the survey. Thanks!',
    status: 'received',
    projectId: 'Customer Satisfaction Survey',
  },
];

module.exports = {
  users,
  projects,
  contacts,
  templates,
  cannedResponses,
  messages,
};
