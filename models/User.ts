import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: function(this: any) {
      return this.authProvider === 'local';
    },
  },
  name: {
    type: String,
    required: true,
  },
  profilePicture: {
    type: String,
    default: '',
  },
  googleId: {
    type: String,
    sparse: true,  // Allows null values but enforces uniqueness when present
  },
  authProvider: {
    type: String,
    enum: ['local', 'google'],
    default: 'local'
  },
  preferences: {
    style: [String],
    colors: [String],
    occasions: [String],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User;