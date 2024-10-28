import { getSession } from 'next-auth/react';

export default async function handler(req, res) {
  const session = await getSession({ req });

  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'POST') {
    try {
      const { contacts, segments } = req.body;

      if (!contacts || !segments) {
        return res.status(400).json({ error: 'Missing contacts or segments data' });
      }

      const generatedTemplates = contacts.map(contact => {
        const message = segments.map(segment => {
          const randomIndex = Math.floor(Math.random() * segment.variations.length);
          return segment.variations[randomIndex];
        }).join(' ');

        // Replace [NAME] with the contact's name (assuming it's the first field in the CSV)
        return message.replace('[NAME]', contact[0]);
      });

      res.status(200).json({ templates: generatedTemplates });
    } catch (error) {
      console.error('Error generating templates:', error);
      res.status(500).json({ error: 'Error generating templates' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
