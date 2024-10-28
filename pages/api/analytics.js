import dbConnect from '../../lib/dbConnect';
import Message from '../../models/Message';
import Contact from '../../models/Contact';
import { verifyToken } from '../../lib/auth';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  await dbConnect();

  const user = await verifyToken(req);
  if (!user) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  try {
    const totalMessages = await Message.countDocuments({ sender: user.id });
    const messagesSentToday = await Message.countDocuments({
      sender: user.id,
      createdAt: { $gte: new Date().setHours(0, 0, 0, 0) }
    });
    const activeContacts = await Contact.countDocuments({ user: user.id, optedOut: false });
    const optedOutContacts = await Contact.countDocuments({ user: user.id, optedOut: true });

    res.status(200).json({
      totalMessages,
      messagesSentToday,
      activeContacts,
      optedOutContacts
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
