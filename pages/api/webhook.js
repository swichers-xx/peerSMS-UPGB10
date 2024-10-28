import dbConnect from '../../lib/dbConnect';
import Message from '../../models/Message';
import Contact from '../../models/Contact';
import twilio from 'twilio';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  await dbConnect();

  const twilioSignature = req.headers['x-twilio-signature'];
  const params = req.body;
  const url = `${process.env.BASE_URL}/api/webhook`;

  const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

  if (!twilioClient.validateRequest(process.env.TWILIO_AUTH_TOKEN, twilioSignature, url, params)) {
    return res.status(403).json({ message: 'Invalid Twilio signature' });
  }

  const { From, Body } = req.body;

  try {
    const contact = await Contact.findOne({ phone: From });
    if (!contact) {
      return res.status(404).json({ message: 'Contact not found' });
    }

    if (Body.trim().toLowerCase() === 'stop') {
      await Contact.findByIdAndUpdate(contact._id, { optedOut: true });
      
      // Send confirmation message
      await twilioClient.messages.create({
        body: "You have been successfully unsubscribed. You will not receive any more messages from us.",
        from: process.env.TWILIO_PHONE_NUMBER,
        to: From
      });

      return res.status(200).json({ message: 'Contact opted out' });
    }

    const message = await Message.create({
      sender: contact._id,
      recipient: contact.user,
      content: Body,
      type: 'incoming'
    });

    // Send the new message via SSE
    if (global.sseConnections && global.sseConnections.has(contact.user.toString())) {
      const sendEvent = global.sseConnections.get(contact.user.toString());
      sendEvent({ type: 'newMessage', message });
    }

    res.status(200).json({ success: true, data: message });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
