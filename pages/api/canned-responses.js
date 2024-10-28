import dbConnect from '../../lib/dbConnect';
import CannedResponse from '../../models/CannedResponse';
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
        const { projectId, page = 1, pageSize = 10 } = req.query;
        if (!projectId) {
          return res.status(400).json({ success: false, message: 'Project ID is required' });
        }

        const skip = (parseInt(page) - 1) * parseInt(pageSize);
        const limit = parseInt(pageSize);

        const totalCannedResponses = await CannedResponse.countDocuments({ project: projectId });
        const totalPages = Math.ceil(totalCannedResponses / limit);

        const cannedResponses = await CannedResponse.find({ project: projectId })
          .skip(skip)
          .limit(limit)
          .sort({ createdAt: -1 });

        res.status(200).json({
          success: true,
          data: cannedResponses,
          currentPage: parseInt(page),
          totalPages: totalPages,
          totalCannedResponses: totalCannedResponses
        });
      } catch (error) {
        console.error('Error fetching canned responses:', error);
        res.status(500).json({ success: false, message: 'Error fetching canned responses', error: error.message });
      }
      break;

    case 'POST':
      try {
        const { projectId, title, content } = req.body;
        if (!projectId) {
          return res.status(400).json({ success: false, message: 'Project ID is required' });
        }
        const cannedResponse = await CannedResponse.create({ project: projectId, title, content });
        res.status(201).json({ success: true, data: cannedResponse });
      } catch (error) {
        console.error('Error creating canned response:', error);
        res.status(400).json({ success: false, message: 'Error creating canned response', error: error.message });
      }
      break;

    default:
      res.status(405).json({ success: false, message: 'Method not allowed' });
      break;
  }
}
