// HotelPro - User Management Routes (Admin only)
const express = require('express');
const router = express.Router();
const User = require('../models/userModel');
const { verifyToken, isAdmin } = require('../middlewares/authMiddleware');

/**
 * @route   GET /api/users
 * @desc    Get list of all registered users (Admin only)
 * @access  Private/Admin
 */
router.get('/', verifyToken, isAdmin, async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    console.error('Fetch Users Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve users.',
      error: error.message,
    });
  }
});

/**
 * @route   DELETE /api/users/:id
 * @desc    Delete a registered user account (Admin only)
 * @access  Private/Admin
 */
router.delete('/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const targetUserId = req.params.id;

    // Prevent administrator from accidentally deleting their own account
    if (targetUserId === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Security warning: You cannot delete your own administrator account.',
      });
    }

    const deletedUser = await User.findByIdAndDelete(targetUserId);
    if (!deletedUser) {
      return res.status(404).json({
        success: false,
        message: 'User account not found.',
      });
    }

    return res.status(200).json({
      success: true,
      message: `User ${deletedUser.name} (${deletedUser.email}) removed successfully!`,
    });
  } catch (error) {
    console.error('Delete User Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete user.',
      error: error.message,
    });
  }
});

module.exports = router;
