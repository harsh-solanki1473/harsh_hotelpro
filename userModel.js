// HotelPro - User Model
// Defines schema for registered users and administrators
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please enter user name'],
      trim: true,
    },
    number: {
      type: String,
      required: [true, 'Please enter contact number'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please enter email address'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Please enter password'],
      minlength: 6,
    },
    gender: {
      type: String,
      required: [true, 'Please select gender'],
      enum: ['Male', 'Female', 'Other', 'male', 'female', 'other'],
    },
    age: {
      type: Number,
      required: [true, 'Please enter age'],
      min: 18,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
  },
  {
    timestamps: true,
  }
);

// Exclude password field by default when converting model instance to JSON
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  return user;
};

const User = mongoose.model('User', userSchema);
module.exports = User;
