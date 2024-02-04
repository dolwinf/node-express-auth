const mongoose = require('mongoose');
const Schema = mongoose.Schema

const postsSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User', 
    required: true
  },
  description: String,
  activityType: String,
  participantLimit: Number,
  currentParticipants: Number,
  status: String,
  createdAt: Date,
  updatedAt: Date,
  location: {
    type: { type: String, default: 'Point' },
    coordinates: [Number] // [longitude, latitude]
  },
  interestedUsers: [{
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    status: String
  }]
}, { timestamps: true });

// Ensure a geospatial index on the location field
postsSchema.index({ location: '2dsphere' });