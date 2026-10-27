// HotelPro - Room Routes
const express = require('express');
const router = express.Router();
const Room = require('../models/roomModel');
const { verifyToken, isAdmin } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

/**
 * @route   GET /api/rooms
 * @desc    Get all rooms (supports optional filter by type or rent)
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    const { type, maxRent } = req.query;
    const filter = {};
    if (type && type !== 'all') {
      filter.type = new RegExp('^' + type + '$', 'i');
    }
    if (maxRent) {
      filter.rent = { $lte: Number(maxRent) };
    }

    const rooms = await Room.find(filter).sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      count: rooms.length,
      rooms,
    });
  } catch (error) {
    console.error('Fetch Rooms Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve rooms.',
      error: error.message,
    });
  }
});

/**
 * @route   GET /api/rooms/:id
 * @desc    Get single room details by ID
 * @access  Public
 */
router.get('/:id', async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found.',
      });
    }

    return res.status(200).json({
      success: true,
      room,
    });
  } catch (error) {
    console.error('Fetch Single Room Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve room details.',
      error: error.message,
    });
  }
});

/**
 * @route   POST /api/rooms/addroom
 * @desc    Add a new room with multiple photo uploads (Admin only)
 * @access  Private/Admin
 */
router.post('/addroom', verifyToken, isAdmin, upload.array('photos', 5), async (req, res) => {
  try {
    const { roomNumber, count, rent, type, description } = req.body;

    if (!roomNumber || !rent || !type || !description) {
      return res.status(400).json({
        success: false,
        message: 'Please provide roomNumber, rent, type, and description.',
      });
    }

    // Check if room number already exists
    const existingRoom = await Room.findOne({ roomNumber: Number(roomNumber) });
    if (existingRoom) {
      return res.status(400).json({
        success: false,
        message: `Room number ${roomNumber} already exists.`,
      });
    }

    // Map uploaded files to static web paths (e.g., /uploads/filename.jpg)
    let photos = [];
    if (req.files && req.files.length > 0) {
      photos = req.files.map((file) => `/uploads/${file.filename}`);
    } else if (req.body.photoUrls) {
      // In case URLs are passed as JSON/string
      photos = Array.isArray(req.body.photoUrls)
        ? req.body.photoUrls
        : [req.body.photoUrls];
    }

    const newRoom = new Room({
      roomNumber: Number(roomNumber),
      count: Number(count) || 1,
      rent: Number(rent),
      type: type.trim(),
      description: description.trim(),
      photos,
      currentbooking: [],
    });

    await newRoom.save();

    return res.status(201).json({
      success: true,
      message: 'Room created successfully!',
      room: newRoom,
    });
  } catch (error) {
    console.error('Add Room Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to add room.',
      error: error.message,
    });
  }
});

/**
 * @route   PUT /api/rooms/:id
 * @desc    Update room details (Admin only)
 * @access  Private/Admin
 */
router.put('/:id', verifyToken, isAdmin, upload.array('photos', 5), async (req, res) => {
  try {
    const { roomNumber, count, rent, type, description } = req.body;
    const room = await Room.findById(req.params.id);

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found.',
      });
    }

    // If roomNumber is updated, check for collision
    if (roomNumber && Number(roomNumber) !== room.roomNumber) {
      const existing = await Room.findOne({ roomNumber: Number(roomNumber) });
      if (existing) {
        return res.status(400).json({
          success: false,
          message: `Room number ${roomNumber} is already in use by another room.`,
        });
      }
      room.roomNumber = Number(roomNumber);
    }

    if (count !== undefined) room.count = Number(count);
    if (rent !== undefined) room.rent = Number(rent);
    if (type) room.type = type.trim();
    if (description) room.description = description.trim();

    // If new photos were uploaded, append or replace
    if (req.files && req.files.length > 0) {
      const newPhotos = req.files.map((file) => `/uploads/${file.filename}`);
      room.photos = [...room.photos, ...newPhotos];
    }

    await room.save();

    return res.status(200).json({
      success: true,
      message: 'Room updated successfully!',
      room,
    });
  } catch (error) {
    console.error('Update Room Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update room.',
      error: error.message,
    });
  }
});

/**
 * @route   DELETE /api/rooms/:id
 * @desc    Delete a room (Admin only)
 * @access  Private/Admin
 */
router.delete('/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const room = await Room.findByIdAndDelete(req.params.id);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found.',
      });
    }

    return res.status(200).json({
      success: true,
      message: `Room #${room.roomNumber} deleted successfully!`,
    });
  } catch (error) {
    console.error('Delete Room Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete room.',
      error: error.message,
    });
  }
});

module.exports = router;
