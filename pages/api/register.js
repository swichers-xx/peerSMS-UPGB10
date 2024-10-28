import dbConnect from '../../lib/dbConnect';
import User from '../../models/User';
import bcrypt from 'bcryptjs';

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
      console.log('Registration failed: Username and password are required');
      return res.status(400).json({ message: 'Username and password are required' });
    }

    console.log('Checking if user already exists...');
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      console.log('Registration failed: Username already exists');
      return res.status(400).json({ message: 'Username already exists' });
    }

    console.log('Hashing password...');
    const hashedPassword = await bcrypt.hash(password, 10);
    
    console.log('Creating new user...');
    const user = new User({ username, password: hashedPassword });
    await user.save();

    console.log('User registered successfully');
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Error registering user', error: error.message });
  }
}