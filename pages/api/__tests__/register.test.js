import { createMocks } from 'node-mocks-http';
import registerHandler from '../register';
import { users } from '../../../testData';
import bcrypt from 'bcryptjs';

jest.mock('../../../lib/dbConnect', () => jest.fn());
jest.mock('../../../models/User', () => ({
  findOne: jest.fn(),
  create: jest.fn(),
}));
jest.mock('bcryptjs');

describe('/api/register', () => {
  it('returns 405 for non-POST requests', async () => {
    const { req, res } = createMocks({
      method: 'GET',
    });

    await registerHandler(req, res);

    expect(res._getStatusCode()).toBe(405);
    expect(JSON.parse(res._getData())).toEqual({ message: 'Method not allowed' });
  });

  it('returns 400 if username or password is missing', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {},
    });

    await registerHandler(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(JSON.parse(res._getData())).toEqual({ message: 'Username and password are required' });
  });

  it('returns 400 if username already exists', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: { username: users[0].username, password: 'newpassword' },
    });

    const User = require('../../../models/User');
    User.findOne.mockResolvedValue(users[0]);

    await registerHandler(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(JSON.parse(res._getData())).toEqual({ message: 'Username already exists' });
  });

  it('returns 201 for successful registration', async () => {
    const newUser = { username: 'newuser', password: 'newpassword' };
    const { req, res } = createMocks({
      method: 'POST',
      body: newUser,
    });

    const User = require('../../../models/User');
    User.findOne.mockResolvedValue(null);
    User.create.mockResolvedValue(newUser);

    bcrypt.hash.mockResolvedValue('hashedpassword');

    await registerHandler(req, res);

    expect(res._getStatusCode()).toBe(201);
    expect(JSON.parse(res._getData())).toEqual({ message: 'User registered successfully' });
    expect(User.create).toHaveBeenCalledWith({ username: 'newuser', password: 'hashedpassword' });
  });

  it('returns 500 if an error occurs during registration', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: { username: 'newuser', password: 'newpassword' },
    });

    const User = require('../../../models/User');
    User.findOne.mockResolvedValue(null);
    User.create.mockRejectedValue(new Error('Database error'));

    await registerHandler(req, res);

    expect(res._getStatusCode()).toBe(500);
    expect(JSON.parse(res._getData())).toEqual({ 
      message: 'Error registering user', 
      error: 'Database error' 
    });
  });
});
