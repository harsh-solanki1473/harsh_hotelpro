// HotelPro - Seed Sample Rooms Script
// Adds initial luxury rooms to catalog if empty
require('dotenv').config();
const mongoose = require('mongoose');
const Room = require('./models/roomModel');

const SAMPLE_ROOMS = [
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
];

async function seedRooms() {
  const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/hotelpro';
  try {
    await mongoose.connect(mongoURI, { serverSelectionTimeoutMS: 4000 });
  } catch (err) {
    // If external Mongo not reachable, exit quietly
    console.log('MongoDB server not running on external URI for seed script, skipping standalone room seed.');
    return;
  }

  try {
    const count = await Room.countDocuments();
    if (count === 0) {
      await Room.insertMany(SAMPLE_ROOMS);
      console.log('✅ Seeded 4 luxury hotel rooms into catalog.');
    } else {
      console.log(`ℹ️ Catalog already has ${count} rooms.`);
    }
    await mongoose.disconnect();
  } catch (e) {
    console.error('Error seeding rooms:', e.message);
  }
}

seedRooms();
