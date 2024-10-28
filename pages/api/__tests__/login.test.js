import { createMocks } from 'node-mocks-http';
import loginHandler from '../login';
import { users } from '../../../testData';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

jest.mock('../../../lib/dbConnect', () => jest.fn());
jest.mock('../../../models/User', () => ({
  findOne: jest.fn(),
}));
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');

describe('/api/login', () => {
  it('returns 405 for non-POST requests', async () => {
    const { req, res } = createMocks({
      method: 'GET',
    });

    await loginHandler(req, res);

    expect(res._getStatusCode()).toBe(405);
    expect(JSON.parse(res._getData())).toEqual({ message: 'Method not allowed' });
  });

  it('returns 400 if username or password is missing', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {},
    });

    await loginHandler(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(JSON.parse(res._getData())).toEqual({ message: 'Username and password are required' });
  });

  it('returns 401 if user is not found', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: { username: 'nonexistent', password: 'password' },
    });

    const User = require('../../../models/User');
    User.findOne.mockResolvedValue(null);

    await loginHandler(req, res);

    expect(res._getStatusCode()).toBe(401);
    expect(JSON.parse(res._getData())).toEqual({ message: 'Invalid credentials' });
  });

  it('returns 401 if password is incorrect', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: { username: users[0].username, password: 'wrongpassword' },
    });

    const User = require('../../../models/User');
    User.findOne.mockResolvedValue(users[0]);

    bcrypt.compare.mockResolvedValue(false);

    await loginHandler(req, res);

    expect(res._getStatusCode()).toBe(401);
    expect(JSON.parse(res._getData())).toEqual({ message: 'Invalid credentials' });
  });

  it('returns 200 and JWT token for successful login', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: { username: users[0].username, password: users[0].password },
    });

    const User = require('../../../models/User');
    User.findOne.mockResolvedValue(users[0]);

    bcrypt.compare.mockResolvedValue(true);
    jwt.sign.mockReturnValue('mock-token');

    await loginHandler(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(JSON.parse(res._getData())).toEqual({
      token: 'mock-token',
      user: expect.objectContaining({ username: users[0].username }),
    });
  });

  // New test for server error
  it('returns 500 for server errors', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: { username: users[0].username, password: users[0].password },
    });

    const User = require('../../../models/User');
    User.findOne.mockRejectedValue(new Error('Database error'));

    await loginHandler(req, res);

    expect(res._getStatusCode()).toBe(500);
    expect(JSON.parse(res._getData())).toEqual({ 
      message: 'Error logging in',
      error: 'Database error'
    });
  });
});
