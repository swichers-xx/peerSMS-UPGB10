import dbConnect from '../../lib/dbConnect';
import Message from '../../models/Message';
import Contact from '../../models/Contact';
import { verifyToken } from '../../lib/auth';
import twilio from 'twilio';

export default async function handler(req, res) {
  const { method } = req;
  await dbConnect();

  try {
    const user = await verifyToken(req);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Unauthorized: Invalid or expired token' });
    }

    switch (method) {
      case 'GET':
        await handleGetMessages(req, res, user);
        break;

      case 'POST':
        await handlePostMessage(req, res, user);
        break;

      default:
        res.status(405).json({ success: false, message: 'Method not allowed' });
        break;
    }
  } catch (error) {
    console.error('Unexpected error:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
}

async function handleGetMessages(req, res, user) {
  try {
    const { recipientId, page = 1, pageSize = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(pageSize);
    const limit = parseInt(pageSize);

    let query = { $or: [{ sender: user.id }, { recipient: user.id }] };
    if (recipientId) {
      query = {
        $or: [
          { sender: user.id, recipient: recipientId },
          { sender: recipientId, recipient: user.id }
        ]
      };
    }

    const totalMessages = await Message.countDocuments(query);
    const totalPages = Math.ceil(totalMessages / limit);

    const messages = await Message.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('recipient')
      .populate('sender');

    res.status(200).json({
      success: true,
      data: messages,
      currentPage: parseInt(page),
      totalPages: totalPages,
      totalMessages: totalMessages
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ success: false, message: 'Error fetching messages', error: error.message });
  }
}

async function handlePostMessage(req, res, user) {
  try {
    const { recipientId, content } = req.body;

    if (!recipientId || !content) {
      return res.status(400).json({ success: false, message: 'Missing required fields: recipientId or content' });
    }

    const contact = await Contact.findById(recipientId);
    if (!contact) {
      return res.status(404).json({ success: false, message: 'Recipient not found' });
    }

    if (contact.optedOut) {
      return res.status(403).json({ success: false, message: 'Recipient has opted out of messages' });
    }

    const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    
    const twilioMessage = await twilioClient.messages.create({
      body: content,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: contact.phone
    });

    const message = await Message.create({
      sender: user.id,
      recipient: recipientId,
      content,
      type: 'outgoing',
      status: twilioMessage.status
    });

    res.status(201).json({ success: true, data: message });
  } catch (error) {
    console.error('Error sending message:', error);
    if (error.code === 21614) {
      res.status(403).json({ success: false, message: 'Unable to send message: Recipient has blocked this number' });
    } else if (error.code === 21211) {
      res.status(400).json({ success: false, message: 'Invalid phone number' });
    } else {
      res.status(500).json({ success: false, message: 'Error sending message', error: error.message });
    }
  }
}
