// HotelPro - Booking Model
// Defines schema for customer reservations and card security standards
const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    roomid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room',
      required: [true, 'Room reference is required'],
    },
    userid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
    },
    username: {
      type: String,
      required: [true, 'Username is required'],
      trim: true,
    },
    fromdate: {
      type: Date,
      required: [true, 'Check-in date is required'],
    },
    todate: {
      type: Date,
      required: [true, 'Check-out date is required'],
    },
    totalAmount: {
      type: Number,
      required: [true, 'Total amount is required'],
    },
    totaldays: {
      type: Number,
      required: [true, 'Total duration in days is required'],
    },
    phone: {
      type: Number,
      required: [true, 'Contact phone number is required'],
    },
    cardDetails: {
      cardholdername: {
        type: String,
        required: [true, 'Cardholder name is required'],
        trim: true,
      },
      cardnumber: {
        type: String,
        required: [true, 'Masked card number is required'], // Only stores last 4 digits (e.g. "**** **** **** 1234")
      },
      expmonthyear: {
        type: String,
        required: [true, 'Expiry date is required'], // Format MM/YY
      },
      // Note: CVV is NEVER stored in database for security compliance
    },
    status: {
      type: String,
      enum: ['booked', 'cancelled'],
      default: 'booked',
    },
  },
  {
    timestamps: true,
  }
);

const Booking = mongoose.model('Booking', bookingSchema);
module.exports = Booking;
