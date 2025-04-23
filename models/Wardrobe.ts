import mongoose from 'mongoose';

const wardrobeItemSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
    enum: ['tops', 'bottoms', 'dresses', 'outerwear', 'shoes', 'accessories'],
  },
  color: {
    type: String,
    required: true,
  },
  season: {
    type: [String],
    required: true,
    enum: ['spring', 'summer', 'fall', 'winter'],
  },
  occasion: {
    type: [String],
    required: true,
  },
  imageUrl: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const WardrobeItem = mongoose.models.WardrobeItem || mongoose.model('WardrobeItem', wardrobeItemSchema);

export default WardrobeItem; 