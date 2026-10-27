// HotelPro - Room Model
// Defines schema for hotel rooms and tracking of active bookings
const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema(
  {
    roomNumber: {
      type: Number,
      required: [true, 'Please provide room number'],
      unique: true,
    },
    count: {
      type: Number,
      required: [true, 'Please specify room count or capacity'],
      default: 1,
    },
    rent: {
      type: Number,
      required: [true, 'Please specify rent per night in INR'],
    },
    type: {
      type: String,
      required: [true, 'Please select room type (e.g. Deluxe, Suite, Standard)'],
      trim: true,
    },
    photos: {
      type: [String],
      default: [],
    },
    description: {
      type: String,
      required: [true, 'Please provide room description'],
      trim: true,
    },
    currentbooking: [
      {
        bookingid: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Booking',
          required: true,
        },
        fromdate: {
          type: Date,
          required: true,
        },
        todate: {
          type: Date,
          required: true,
        },
        userid: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        status: {
          type: String,
          default: 'booked',
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Room = mongoose.model('Room', roomSchema);
module.exports = Room;
