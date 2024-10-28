import dbConnect from '../../lib/dbConnect';
import Contact from '../../models/Contact';
import { verifyToken } from '../../lib/auth';
import multer from 'multer';
import csv from 'csv-parser';
import fs from 'fs';
import { Readable } from 'stream';

export const config = {
  api: {
    bodyParser: false,
  },
};

const upload = multer({ dest: '/tmp' });

export default async function handler(req, res) {
  try {
    await dbConnect();
    const user = await verifyToken(req);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Unauthorized: Invalid or expired token' });
    }

    switch (req.method) {
      case 'GET':
        await handleGetContacts(req, res);
        break;
      case 'POST':
        await handlePostContacts(req, res);
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

async function handleGetContacts(req, res) {
  try {
    const { projectId, page = 1, pageSize = 10, search = '' } = req.query;

    if (!projectId) {
      return res.status(400).json({ success: false, message: 'Missing projectId parameter' });
    }

    const skip = (parseInt(page) - 1) * parseInt(pageSize);
    const limit = parseInt(pageSize);

    const query = {
      project: projectId,
      $or: [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { 'additionalFields.email': { $regex: search, $options: 'i' } }
      ]
    };

    const [contacts, totalContacts] = await Promise.all([
      Contact.find(query).skip(skip).limit(limit).sort({ createdAt: -1 }),
      Contact.countDocuments(query)
    ]);

    const totalPages = Math.ceil(totalContacts / limit);

    res.status(200).json({
      success: true,
      data: contacts,
      currentPage: parseInt(page),
      totalPages,
      totalContacts
    });
  } catch (error) {
    console.error('Error fetching contacts:', error);
    res.status(500).json({ success: false, message: 'Error fetching contacts', error: error.message });
  }
}

async function handlePostContacts(req, res) {
  upload.single('csv')(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ success: false, message: 'File upload failed', error: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    if (!req.body.projectId) {
      return res.status(400).json({ success: false, message: 'Missing projectId in request body' });
    }

    const uploadMode = req.body.uploadMode || 'advanced';
    const results = [];
    let rowCount = 0;
    let errorCount = 0;

    try {
      await new Promise((resolve, reject) => {
        fs.createReadStream(req.file.path)
          .pipe(csv())
          .on('data', (row) => {
            rowCount++;
            try {
              const contact = validateAndFormatContact(row, req.body.projectId, uploadMode);
              if (contact) {
                results.push(contact);
              } else {
                errorCount++;
              }
            } catch (error) {
              console.error(`Error processing row ${rowCount}:`, error);
              errorCount++;
            }

            if (results.length === 1000) {
              insertContacts(results);
              results.length = 0;
            }
          })
          .on('end', resolve)
          .on('error', reject);
      });

      if (results.length > 0) {
        await insertContacts(results);
      }

      fs.unlinkSync(req.file.path);

      res.status(201).json({
        success: true,
        message: `${rowCount - errorCount} contacts uploaded successfully. ${errorCount} errors encountered.`
      });
    } catch (error) {
      console.error('Error processing CSV:', error);
      res.status(500).json({ success: false, message: 'Error processing CSV', error: error.message });
    }
  });
}

function validateAndFormatContact(row, projectId, uploadMode) {
  if (uploadMode === 'simple') {
    if (!row.name || !row.phone || !row.link) {
      console.warn('Skipping invalid contact:', row);
      return null;
    }

    return {
      project: projectId,
      name: row.name.trim(),
      phone: row.phone.trim(),
      additionalFields: {
        link: row.link.trim(),
        pin: row.pin ? row.pin.trim() : '',
        var1: row.var1 ? row.var1.trim() : '',
        var2: row.var2 ? row.var2.trim() : '',
        var3: row.var3 ? row.var3.trim() : ''
      }
    };
  } else {
    if (!row.name || !row.phone) {
      console.warn('Skipping invalid contact:', row);
      return null;
    }

    const additionalFields = Object.entries(row).reduce((acc, [key, value]) => {
      if (key !== 'name' && key !== 'phone') {
        acc[key] = value;
      }
      return acc;
    }, {});

    return {
      project: projectId,
      name: row.name.trim(),
      phone: row.phone.trim(),
      additionalFields
    };
  }
}

async function insertContacts(contacts) {
  try {
    const operations = contacts.map(contact => ({
      updateOne: {
        filter: { project: contact.project, phone: contact.phone },
        update: { $set: contact },
        upsert: true
      }
    }));

    await Contact.bulkWrite(operations);
  } catch (error) {
    console.error('Error inserting contacts:', error);
    throw error;
  }
}
