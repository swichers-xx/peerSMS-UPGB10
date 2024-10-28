import dbConnect from '../../lib/dbConnect';
import User from '../../models/User';
import { verifyToken } from '../../lib/auth';

export default async function handler(req, res) {
  const { method } = req;
  await dbConnect();

  const user = await verifyToken(req);
  if (!user) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  switch (method) {
    case 'GET':
      try {
        const userData = await User.findById(user.id).select('-password');
        res.status(200).json({ success: true, user: userData });
      } catch (error) {
        console.error('Error fetching user data:', error);
        res.status(500).json({ success: false, message: 'Error fetching user data', error: error.message });
      }
      break;

    case 'PUT':
      try {
        const { name, email, preferences } = req.body;
        const updatedUser = await User.findByIdAndUpdate(
          user.id,
          { name, email, preferences },
          { new: true, runValidators: true }
        ).select('-password');

        if (!updatedUser) {
          return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.status(200).json({ success: true, user: updatedUser });
      } catch (error) {
        console.error('Error updating user data:', error);
        res.status(400).json({ success: false, message: 'Error updating user data', error: error.message });
      }
      break;

    default:
      res.status(405).json({ success: false, message: 'Method not allowed' });
      break;
  }
}
