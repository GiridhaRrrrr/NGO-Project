const mongoose = require('mongoose');

const helpRequestSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userName: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['Medical', 'Financial', 'Education', 'Disaster'], 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['Submitted', 'Verified', 'Accepted', 'Completed', 'Rejected'], 
    default: 'Submitted' 
  },
  description: { type: String, required: true },
  contact: { type: String, required: true },
  location: {
    type: { type: String, default: 'Point' },
    coordinates: { type: [Number], required: true } // [lng, lat]
  },
  imageUrl: { type: String },
  priorityScore: { type: Number, default: 0 },
  assignedNgoId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

helpRequestSchema.index({ location: '2dsphere' });
module.exports = mongoose.model('HelpRequest', helpRequestSchema);