import dbConnect from '../../lib/dbConnect';
import User from '../../models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    console.log('Attempting to connect to the database...');
    await dbConnect();
    console.log('Successfully connected to the database.');

    const { username, password } = req.body;

    if (!username || !password) {
      console.log('Login failed: Username and password are required');
      return res.status(400).json({ message: 'Username and password are required' });
    }

    console.log('Searching for user...');
    const user = await User.findOne({ username });
    if (!user) {
      console.log('Login failed: User not found');
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    console.log('Comparing passwords...');
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log('Login failed: Incorrect password');
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    console.log('Generating JWT token...');
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    
    console.log('Login successful');
    res.status(200).json({ token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Error logging in', error: error.message });
  }
}
