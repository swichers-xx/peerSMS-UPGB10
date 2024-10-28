import { createMocks } from 'node-mocks-http';
import handler from '../generate-invitations';
import dbConnect from '../../../lib/dbConnect';
import Template from '../../../models/Template';
import Contact from '../../../models/Contact';
import Project from '../../../models/Project';

jest.mock('../../../lib/dbConnect');
jest.mock('../../../models/Template');
jest.mock('../../../models/Contact');
jest.mock('../../../models/Project');
jest.mock('../../../lib/auth', () => ({
  authMiddleware: (handler) => handler,
}));

describe('generate-invitations API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should generate invitations successfully', async () => {
    const templateId = 'template123';
    const contactIds = ['contact1', 'contact2'];
    const projectId = 'project123';

    const mockTemplate = {
      _id: templateId,
      sections: {
        greeting: ['Hello [NAME]', 'Hi [NAME]'],
        identifier: ['This is a test'],
        message: ['Please take our survey'],
        link: ['https://example.com/{extern_id}'],
        optout: ['Reply STOP to opt out'],
      },
    };

    const mockContacts = [
      { _id: 'contact1', name: 'John', extern_id: '001' },
      { _id: 'contact2', name: 'Jane', extern_id: '002' },
    ];

    const mockProject = {
      _id: projectId,
      invitations: [],
      save: jest.fn(),
    };

    Template.findById.mockResolvedValue(mockTemplate);
    Contact.find.mockResolvedValue(mockContacts);
    Project.findById.mockResolvedValue(mockProject);

    const { req, res } = createMocks({
      method: 'POST',
      body: {
        templateId,
        contactIds,
        projectId,
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const jsonResponse = JSON.parse(res._getData());
    expect(jsonResponse.message).toBe('Invitations generated successfully');
    expect(jsonResponse.count).toBe(2);
    expect(jsonResponse.invitations).toHaveLength(2);
    expect(jsonResponse.invitations[0].invitation).toMatch(/Hello John|Hi John/);
    expect(jsonResponse.invitations[0].invitation).toContain('https://example.com/001');
    expect(jsonResponse.invitations[1].invitation).toMatch(/Hello Jane|Hi Jane/);
    expect(jsonResponse.invitations[1].invitation).toContain('https://example.com/002');
    expect(mockProject.save).toHaveBeenCalled();
  });

  it('should handle missing template', async () => {
    Template.findById.mockResolvedValue(null);

    const { req, res } = createMocks({
      method: 'POST',
      body: {
        templateId: 'nonexistent',
        contactIds: ['contact1'],
        projectId: 'project123',
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(404);
    expect(JSON.parse(res._getData()).error).toBe('Template not found');
  });

  // Add more test cases as needed
});
