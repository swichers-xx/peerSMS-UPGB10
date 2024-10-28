import { verifyToken } from '../../lib/auth';

export default async function handler(req, res) {
  const user = await verifyToken(req);
  if (!user) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  });

  const sendEvent = (data) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  // Store the connection in a global variable
  if (!global.sseConnections) {
    global.sseConnections = new Map();
  }
  global.sseConnections.set(user.id, sendEvent);

  // Remove the connection when the client disconnects
  req.on('close', () => {
    global.sseConnections.delete(user.id);
  });
}
