import dbConnect from '../../lib/dbConnect';
import Template from '../../models/Template';
import Contact from '../../models/Contact';
import Project from '../../models/Project';
import { authMiddleware } from '../../lib/auth';

function generateRandomInvitation(template, contact) {
  const invitation = {};
  const requiredSections = ['greeting', 'identifier', 'message', 'link', 'optout'];

  for (const section of requiredSections) {
    if (!template.sections[section] || !Array.isArray(template.sections[section]) || template.sections[section].length === 0) {
      throw new Error(`Invalid template structure: ${section} must be a non-empty array`);
    }
    invitation[section] = template.sections[section][Math.floor(Math.random() * template.sections[section].length)];
  }

  // Replace placeholders with contact information
  const replacePlaceholders = (text) => {
    return text.replace(/\[NAME\]/g, contact.name || '')
               .replace(/\{extern_id\}/g, contact.extern_id || '')
               .replace(/\{(\w+)\}/g, (match, field) => {
                 return contact[field] || contact.additionalFields?.[field] || match;
               });
  };

  for (const [key, value] of Object.entries(invitation)) {
    invitation[key] = replacePlaceholders(value);
  }

  // Combine all sections into a single message
  const combinedMessage = `${invitation.greeting} ${invitation.identifier} ${invitation.message} ${invitation.link} ${invitation.optout}`;

  return combinedMessage.trim();
}

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await dbConnect();

    const { templateId, contactIds, projectId } = req.body;

    if (!templateId || !contactIds || !Array.isArray(contactIds) || contactIds.length === 0 || !projectId) {
      return res.status(400).json({ error: 'Invalid request body' });
    }

    const template = await Template.findById(templateId);
    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    const contacts = await Contact.find({ _id: { $in: contactIds } });
    if (contacts.length !== contactIds.length) {
      return res.status(404).json({ error: 'One or more contacts not found' });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const generatedInvitations = contacts.map(contact => {
      try {
        return {
          contact: contact._id,
          invitation: generateRandomInvitation(template, contact)
        };
      } catch (error) {
        console.error(`Error generating invitation for contact ${contact._id}:`, error);
        return null;
      }
    }).filter(invitation => invitation !== null);

    if (generatedInvitations.length === 0) {
      return res.status(500).json({ error: 'Failed to generate any valid invitations' });
    }

    // Store the generated invitations in the project
    project.invitations = project.invitations.concat(generatedInvitations);
    await project.save();

    res.status(200).json({
      message: 'Invitations generated successfully',
      count: generatedInvitations.length,
      invitations: generatedInvitations
    });
  } catch (error) {
    console.error('Error generating invitations:', error);
    res.status(500).json({ error: 'Failed to generate invitations', details: error.message });
  }
}

export default authMiddleware(handler);
