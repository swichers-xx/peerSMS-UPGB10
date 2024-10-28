import mongoose from 'mongoose';

const TemplateSchema = new mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  sections: {
    greeting: [String],
    identifier: [String],
    message: [String],
    link: [String],
    optout: [String]
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.models.Template || mongoose.model('Template', TemplateSchema);
