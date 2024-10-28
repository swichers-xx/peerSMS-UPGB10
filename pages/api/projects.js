import dbConnect from '../../lib/dbConnect';
import Project from '../../models/Project';
import { verifyToken } from '../../lib/auth';

export default async function handler(req, res) {
  await dbConnect();

  const user = await verifyToken(req);
  if (!user) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  switch (req.method) {
    case 'GET':
      try {
        const page = parseInt(req.query.page) || 1;
        const pageSize = parseInt(req.query.pageSize) || 9;
        const skip = (page - 1) * pageSize;
        const search = req.query.search || '';

        const query = {
          user: user.id,
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } }
          ]
        };

        const totalProjects = await Project.countDocuments(query);
        const totalPages = Math.ceil(totalProjects / pageSize);

        const projects = await Project.find(query)
          .skip(skip)
          .limit(pageSize)
          .sort({ createdAt: -1 });

        res.status(200).json({
          success: true,
          data: projects,
          currentPage: page,
          totalPages: totalPages,
          totalProjects: totalProjects
        });
      } catch (error) {
        console.error('Error fetching projects:', error);
        res.status(500).json({ success: false, message: 'Error fetching projects', error: error.message });
      }
      break;
    case 'POST':
      try {
        const project = await Project.create({ ...req.body, user: user.id });
        res.status(201).json({ success: true, data: project });
      } catch (error) {
        console.error('Error creating project:', error);
        res.status(400).json({ success: false, message: 'Error creating project', error: error.message });
      }
      break;
    default:
      res.status(405).json({ success: false, message: 'Method not allowed' });
      break;
  }
}
