import { createMocks } from 'node-mocks-http';
import handler from '../contacts';
import dbConnect from '../../../lib/dbConnect';
import Contact from '../../../models/Contact';
import { verifyToken } from '../../../lib/auth';

jest.mock('../../../lib/dbConnect');
jest.mock('../../../models/Contact');
jest.mock('../../../lib/auth');

describe('/api/contacts', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET', () => {
    it('should return contacts for a valid project', async () => {
      const { req, res } = createMocks({
        method: 'GET',
        query: {
          projectId: 'testProjectId',
          page: '1',
          pageSize: '10',
          search: ''
        }
      });

      verifyToken.mockResolvedValue({ id: 'testUserId' });
      Contact.find.mockReturnValue({
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        sort: jest.fn().mockResolvedValue([
          { _id: 'contact1', name: 'John Doe', phone: '1234567890' },
          { _id: 'contact2', name: 'Jane Doe', phone: '0987654321' }
        ])
      });
      Contact.countDocuments.mockResolvedValue(2);

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      expect(JSON.parse(res._getData())).toEqual({
        success: true,
        data: [
          { _id: 'contact1', name: 'John Doe', phone: '1234567890' },
          { _id: 'contact2', name: 'Jane Doe', phone: '0987654321' }
        ],
        currentPage: 1,
        totalPages: 1,
        totalContacts: 2
      });
    });

    it('should return 400 if projectId is missing', async () => {
      const { req, res } = createMocks({
        method: 'GET',
        query: {}
      });

      verifyToken.mockResolvedValue({ id: 'testUserId' });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      expect(JSON.parse(res._getData())).toEqual({
        success: false,
        message: 'Missing projectId parameter'
      });
    });
  });

  describe('POST', () => {
    // Add POST tests here when implemented
  });

  it('should return 405 for unsupported methods', async () => {
    const { req, res } = createMocks({
      method: 'PUT'
    });

    verifyToken.mockResolvedValue({ id: 'testUserId' });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(405);
    expect(JSON.parse(res._getData())).toEqual({
      success: false,
      message: 'Method not allowed'
    });
  });
});
