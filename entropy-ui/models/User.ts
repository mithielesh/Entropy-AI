import mongoose, { Schema, model, models } from 'mongoose';

const UserSchema = new Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true, // No duplicate emails allowed
  },
  username: {
    type: String,
    required: [true, 'Username is required'],
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    select: false, // Security: Don't return password by default in queries
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// The "models" check is crucial for Next.js to prevent recompilation errors
const User = models.User || model('User', UserSchema);

export default User;