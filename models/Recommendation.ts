import mongoose from 'mongoose';

// Define the schema for the recommendation
const recommendationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  eventTitle: {
    type: String,
    required: true,
  },
  eventType: {
    type: String,
    required: true,
  },
  eventDate: {
    type: String,
    required: true,
  },
  eventLocation: {
    type: String,
    required: true,
  },
  clothing: String,
  weather: {
    temperature: Number,
    description: String,
    location: String,
    country: String,
  },
  outfit: {
    prompt: String,
    imageUrl: String, // Store image URL instead of raw image data
    paymentRequired: Boolean,
    message: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Create the model if it doesn't exist, or use the existing one
const Recommendation = mongoose.models.Recommendation || mongoose.model('Recommendation', recommendationSchema);

export default Recommendation; 