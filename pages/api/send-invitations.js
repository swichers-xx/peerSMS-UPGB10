import { getSession } from 'next-auth/react';
import dbConnect from '../../lib/dbConnect';
import Project from '../../models/Project';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const session = await getSession({ req });
  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  await dbConnect();

  try {
    const { projectId, invitations, useVoxcoApi } = req.body;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const sentInvitations = [];

    if (useVoxcoApi) {
      // Voxco API method
      const voxcoApiKey = process.env.VOXCO_API_KEY;
      const voxcoApiUrl = `${process.env.VOXCO_API_BASE_URL}/Distribution/sms`;

      for (const invitation of invitations) {
        const smsDistribution = {
          SurveyId: project.surveyId,
          Name: `SMS Invitation for ${invitation.contact.name}`,
          FromNumbers: process.env.SMS_FROM_NUMBER,
          Message: Object.values(invitation.invitation).join('\n'),
          DeliveryDate: new Date().toISOString(),
          CaseFilter: {
            EmailStatus: "All",
            SMSStatus: "All",
            Expression: `{CaseId} = ${invitation.contact.id}`
          }
        };

        try {
          const response = await fetch(voxcoApiUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Client ${voxcoApiKey}`,
            },
            body: JSON.stringify(smsDistribution),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Voxco API error: ${response.status} - ${errorData.message || 'Unknown error'}`);
          }

          const data = await response.json();
          sentInvitations.push(data);
        } catch (error) {
          console.error(`Error sending invitation to ${invitation.contact.name}:`, error);
          sentInvitations.push({ error: error.message, contact: invitation.contact });
        }
      }
    } else {
      // Existing method
      for (const invitation of invitations) {
        // Your existing logic to send invitations
        // This could involve updating the database, sending emails, etc.
        // For example:
        sentInvitations.push({ status: 'sent', invitation });
      }
    }

    const successfulInvitations = sentInvitations.filter(inv => !inv.error);
    const failedInvitations = sentInvitations.filter(inv => inv.error);

    res.status(200).json({
      message: 'Invitations processed',
      data: {
        successful: successfulInvitations,
        failed: failedInvitations
      }
    });
  } catch (error) {
    console.error('Error processing invitations:', error);
    res.status(500).json({ message: 'Failed to process invitations', error: error.message });
  }
}
