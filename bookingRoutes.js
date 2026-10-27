// HotelPro - Booking Routes
const express = require('express');
const router = express.Router();
const Booking = require('../models/bookingModel');
const Room = require('../models/roomModel');
const { verifyToken, isAdmin } = require('../middlewares/authMiddleware');

/**
 * Helper to normalize a date to midnight UTC/local start of day for accurate comparison
 */
const startOfDay = (dateString) => {
  const d = new Date(dateString);
  d.setHours(0, 0, 0, 0);
  return d;
};

/**
 * @route   POST /api/bookings/bookroom
 * @desc    Reserve a room for specified dates (calculates total server-side, validates no date overlaps)
 * @access  Private (Logged-in users)
 */
router.post('/bookroom', verifyToken, async (req, res) => {
  try {
    const { roomid, fromdate, todate, phone, cardDetails } = req.body;

    // Validate inputs
    if (!roomid || !fromdate || !todate || !phone || !cardDetails) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all booking details: roomid, fromdate, todate, phone, and payment card details.',
      });
    }

    const checkIn = new Date(fromdate);
    const checkOut = new Date(todate);

    // Validate check-in date is not in the past (allow today)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkInNormalized = new Date(checkIn);
    checkInNormalized.setHours(0, 0, 0, 0);

    if (checkInNormalized < today) {
      return res.status(400).json({
        success: false,
        message: 'Check-in date cannot be in the past.',
      });
    }

    // Validate checkout is strictly after check-in
    if (checkOut <= checkIn) {
      return res.status(400).json({
        success: false,
        message: 'Check-out date must be strictly after the check-in date.',
      });
    }

    // Find the requested room
    const room = await Room.findById(roomid);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'The requested room was not found.',
      });
    }

    // Check for date overlaps with active bookings for this room
    // Overlap condition: requestedFrom < existingTo && requestedTo > existingFrom
    const requestedFromTime = checkIn.getTime();
    const requestedToTime = checkOut.getTime();

    const hasOverlap = room.currentbooking.some((b) => {
      if (b.status !== 'booked') return false; // Ignore cancelled bookings
      const existingFromTime = new Date(b.fromdate).getTime();
      const existingToTime = new Date(b.todate).getTime();
      return requestedFromTime < existingToTime && requestedToTime > existingFromTime;
    });

    if (hasOverlap) {
      return res.status(400).json({
        success: false,
        message: 'This room is already booked for the selected dates. Please choose different dates.',
      });
    }

    // Server-side calculation of total days and total amount
    const diffTime = Math.abs(checkOut - checkIn);
    const totaldays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    const totalAmount = totaldays * room.rent;

    // Card security: Extract ONLY last 4 digits, NEVER store CVV
    const rawCardNumber = String(cardDetails.cardnumber || '').replace(/\s+/g, '');
    const last4 = rawCardNumber.slice(-4) || 'XXXX';
    const maskedCardNumber = `**** **** **** ${last4}`;

    if (!cardDetails.cardholdername || !cardDetails.expmonthyear) {
      return res.status(400).json({
        success: false,
        message: 'Please provide valid cardholder name and expiry date.',
      });
    }

    // Create and save new booking record
    const newBooking = new Booking({
      roomid: room._id,
      userid: req.user._id,
      username: req.user.name,
      fromdate: checkIn,
      todate: checkOut,
      totalAmount,
      totaldays,
      phone: Number(phone),
      cardDetails: {
        cardholdername: cardDetails.cardholdername.trim(),
        cardnumber: maskedCardNumber,
        expmonthyear: cardDetails.expmonthyear.trim(),
      },
      status: 'booked',
    });

    await newBooking.save();

    // Update room's currentbooking array
    room.currentbooking.push({
      bookingid: newBooking._id,
      fromdate: checkIn,
      todate: checkOut,
      userid: req.user._id,
      status: 'booked',
    });

    await room.save();

    return res.status(201).json({
      success: true,
      message: 'Room booked successfully! Your reservation is confirmed.',
      booking: newBooking,
    });
  } catch (error) {
    console.error('Book Room Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to process booking reservation.',
      error: error.message,
    });
  }
});

/**
 * @route   GET /api/bookings/user
 * @desc    Get booking history for the logged-in user
 * @access  Private (Logged-in user)
 */
router.get('/user', verifyToken, async (req, res) => {
  try {
    const bookings = await Booking.find({ userid: req.user._id })
      .populate('roomid')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    console.error('User Bookings Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve your bookings.',
      error: error.message,
    });
  }
});

/**
 * @route   GET /api/bookings
 * @desc    Get all bookings across the hotel system (Admin only)
 * @access  Private/Admin
 */
router.get('/', verifyToken, isAdmin, async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('roomid')
      .populate('userid', 'name email number')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    console.error('Admin Bookings Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve all bookings.',
      error: error.message,
    });
  }
});

/**
 * @route   PUT /api/bookings/cancel/:id
 * @desc    Cancel a booking (allowed for booking owner or admin)
 *          Sets status to 'cancelled' and removes entry from room.currentbooking
 * @access  Private
 */
router.put('/cancel/:id', verifyToken, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking reservation not found.',
      });
    }

    // Verify ownership or admin privileges
    const isOwner = booking.userid.toString() === req.user._id.toString();
    const isAdministrator = req.user.role === 'admin';

    if (!isOwner && !isAdministrator) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only cancel your own bookings.',
      });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'This booking has already been cancelled.',
      });
    }

    // Update booking status
    booking.status = 'cancelled';
    await booking.save();

    // Remove this booking from room.currentbooking so dates become available again
    const room = await Room.findById(booking.roomid);
    if (room) {
      room.currentbooking = room.currentbooking.filter(
        (b) => b.bookingid.toString() !== booking._id.toString()
      );
      await room.save();
    }

    return res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully. The room is now available for those dates.',
      booking,
    });
  } catch (error) {
    console.error('Cancel Booking Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to cancel booking.',
      error: error.message,
    });
  }
});

module.exports = router;
