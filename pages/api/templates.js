import dbConnect from '../../lib/dbConnect';
import Template from '../../models/Template';
import { verifyToken } from '../../lib/auth';

const validateTemplateStructure = (sections) => {
  const requiredSections = ['greeting', 'identifier', 'message', 'link', 'optout'];
  for (const section of requiredSections) {
    if (!sections[section] || !Array.isArray(sections[section]) || sections[section].length === 0) {
      throw new Error(`Invalid template structure: ${section} must be a non-empty array`);
    }
  }
};

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
        const { projectId, page = 1, pageSize = 10, search = '' } = req.query;
        if (!projectId) {
          return res.status(400).json({ success: false, message: 'Project ID is required' });
        }

        const skip = (parseInt(page) - 1) * parseInt(pageSize);
        const limit = parseInt(pageSize);

        const query = {
          project: projectId,
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { 'sections.greeting': { $regex: search, $options: 'i' } },
            { 'sections.identifier': { $regex: search, $options: 'i' } },
            { 'sections.message': { $regex: search, $options: 'i' } },
            { 'sections.link': { $regex: search, $options: 'i' } },
            { 'sections.optout': { $regex: search, $options: 'i' } }
          ]
        };

        const totalTemplates = await Template.countDocuments(query);
        const totalPages = Math.ceil(totalTemplates / limit);

        const templates = await Template.find(query)
          .skip(skip)
          .limit(limit)
          .sort({ createdAt: -1 });

        res.status(200).json({
          success: true,
          data: templates,
          currentPage: parseInt(page),
          totalPages: totalPages,
          totalTemplates: totalTemplates
        });
      } catch (error) {
        console.error('Error fetching templates:', error);
        res.status(500).json({ success: false, message: 'Error fetching templates', error: error.message });
      }
      break;

    case 'POST':
      try {
        const { projectId, name, sections } = req.body;
        if (!projectId) {
          return res.status(400).json({ success: false, message: 'Project ID is required' });
        }
        validateTemplateStructure(sections);
        const template = await Template.create({ project: projectId, name, sections });
        res.status(201).json({ success: true, data: template });
      } catch (error) {
        console.error('Error creating template:', error);
        res.status(400).json({ success: false, message: 'Error creating template', error: error.message });
      }
      break;

    case 'PUT':
      try {
        const { id, name, sections } = req.body;
        if (!id) {
          return res.status(400).json({ success: false, message: 'Template ID is required' });
        }
        validateTemplateStructure(sections);
        const updatedTemplate = await Template.findByIdAndUpdate(
          id,
          { name, sections },
          { new: true, runValidators: true }
        );
        if (!updatedTemplate) {
          return res.status(404).json({ success: false, message: 'Template not found' });
        }
        res.status(200).json({ success: true, data: updatedTemplate });
      } catch (error) {
        console.error('Error updating template:', error);
        res.status(400).json({ success: false, message: 'Error updating template', error: error.message });
      }
      break;

    default:
      res.status(405).json({ success: false, message: 'Method not allowed' });
      break;
  }
}
