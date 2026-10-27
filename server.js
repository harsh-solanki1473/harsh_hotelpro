// HotelPro (Roomly) - Backend Server
// Main entry point for Express application and MongoDB database connection
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');

// Route Handlers
const authRoutes = require('./routes/authRoutes');
const roomRoutes = require('./routes/roomRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// =====================================
// MIDDLEWARES
// =====================================
// CORS configuration: allow Vite frontend and API clients
app.use(
  cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:3000'],
    credentials: true,
  })
);

// Express body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static room uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// =====================================
// API ROUTES
// =====================================
app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/users', userRoutes);

// Root health-check endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: '🏨 HotelPro (Roomly) API is running smoothly!',
    version: '1.0.0',
    documentation: {
      auth: '/api/auth',
      rooms: '/api/rooms',
      bookings: '/api/bookings',
      users: '/api/users',
      uploads: '/uploads',
    },
  });
});

// =====================================
// GLOBAL ERROR HANDLING
// =====================================
app.use((err, req, res, next) => {
  console.error('Unhandled Application Error:', err);

  // Multer file upload errors
  if (err.name === 'MulterError') {
    return res.status(400).json({
      success: false,
      message: `Upload error: ${err.message}`,
    });
  }

  // Mongoose validation errors
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((val) => val.message);
    return res.status(400).json({
      success: false,
      message: messages.join(', '),
    });
  }

  // MongoDB duplicate key error (code 11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    return res.status(400).json({
      success: false,
      message: `A record with this ${field} already exists.`,
    });
  }

  return res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

// 404 handler for undefined endpoints
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint not found: ${req.method} ${req.originalUrl}`,
  });
});

// =====================================
// DATABASE CONNECTION & SERVER START
// =====================================
let memoryServerInstance = null;

async function connectDatabaseAndStartServer() {
  const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/hotelpro';
  console.log(`Connecting to MongoDB at: ${mongoURI}...`);

  try {
    // Attempt standard connection with a 4-second timeout
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 4000,
    });
    console.log(' MongoDB connected successfully to:', mongoURI);
  } catch (error) {
    console.warn('⚠️ Direct connection to MongoDB failed:', error.message);
    console.log('🔄 Launching MongoMemoryServer development fallback...');

    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      memoryServerInstance = await MongoMemoryServer.create({
        instance: {
          dbName: 'hotelpro',
        },
      });
      const fallbackUri = memoryServerInstance.getUri();
      console.log('✅ In-Memory MongoDB started at:', fallbackUri);
      await mongoose.connect(fallbackUri);
      console.log('✅ MongoDB connected successfully via MongoMemoryServer!');

      // Seed default admin and sample rooms automatically
      const User = require('./models/userModel');
      const Room = require('./models/roomModel');
      const bcrypt = require('bcryptjs');

      const existingAdmin = await User.findOne({ email: 'admin@hotelpro.com' });
      if (!existingAdmin) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('Admin@123', salt);
        await User.create({
          name: 'System Admin',
          number: '9876543210',
          email: 'admin@hotelpro.com',
          password: hashedPassword,
          gender: 'Other',
          age: 30,
          role: 'admin',
        });
        console.log('🎉 Admin user automatically seeded (admin@hotelpro.com / Admin@123)');
      }

      const roomCount = await Room.countDocuments();
      if (roomCount === 0) {
        await Room.insertMany([
          {
            roomNumber: 101,
            count: 2,
            rent: 2800,
            type: 'Standard',
            photos: [
              'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1000&q=80',
              'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1000&q=80',
            ],
            description: 'Cozy queen-sized bedroom with contemporary interior, smart workspace desk, and rainfall shower.',
            currentbooking: [],
          },
          {
            roomNumber: 202,
            count: 3,
            rent: 4200,
            type: 'Deluxe',
            photos: [
              'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1000&q=80',
              'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1000&q=80',
            ],
            description: 'Spacious deluxe room featuring a private balcony with sunset views, plush king bed, and complimentary minibar.',
            currentbooking: [],
          },
          {
            roomNumber: 305,
            count: 2,
            rent: 6500,
            type: 'Executive Suite',
            photos: [
              'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1000&q=80',
              'https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=1000&q=80',
            ],
            description: 'Luxurious suite featuring a separate living lounge, panoramic floor-to-ceiling windows, and whirlpool jacuzzi bath.',
            currentbooking: [],
          },
          {
            roomNumber: 401,
            count: 1,
            rent: 9800,
            type: 'Presidential Suite',
            photos: [
              'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1000&q=80',
              'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=1000&q=80',
            ],
            description: 'The pinnacle of luxury: penthouse floor suite with private terrace, personal butler service, and marble master bath.',
            currentbooking: [],
          },
        ]);
        console.log('🎉 Sample luxury hotel rooms automatically seeded!');
      }
    } catch (fallbackError) {
      console.error('❌ Failed to start fallback MongoDB:', fallbackError.message);
      process.exit(1);
    }
  }

  app.listen(PORT, '127.0.0.1', () => {
    console.log(`🚀 HotelPro Server running on http://127.0.0.1:${PORT} (http://localhost:${PORT})`);
  });
}

connectDatabaseAndStartServer();

// Graceful shutdown handling
process.on('SIGINT', async () => {
  await mongoose.disconnect();
  if (memoryServerInstance) {
    await memoryServerInstance.stop();
  }
  process.exit(0);
});
