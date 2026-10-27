// HotelPro - Seed Admin Script
// Run directly: node seedAdmin.js or npm run seed
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/userModel');

const ADMIN_CREDENTIALS = {
  name: 'System Admin',
  number: '9876543210',
  email: 'admin@hotelpro.com',
  password: 'Admin@123',
  gender: 'Other',
  age: 30,
  role: 'admin',
};

async function seedAdmin() {
  const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/hotelpro';
  console.log('🔄 Connecting to MongoDB at:', mongoURI);

  try {
    // Attempt connection with a short timeout to handle when local MongoDB is not running
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 4000,
    });
    console.log('✅ Connected to MongoDB successfully.');
  } catch (err) {
    console.log('⚠️ Could not connect to primary MONGO_URI, attempting MongoMemoryServer fallback...');
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create({
        instance: {
          port: 27017,
          dbName: 'hotelpro',
        },
      });
      const uri = mongod.getUri();
      console.log('✅ MongoMemoryServer started on port 27017 URI:', uri);
      await mongoose.connect(uri);
    } catch (memErr) {
      console.error('❌ Failed to connect to MongoDB:', err.message);
      process.exit(1);
    }
  }

  try {
    const existingAdmin = await User.findOne({ email: ADMIN_CREDENTIALS.email });
    if (existingAdmin) {
      console.log('ℹ️ Admin user already exists with email:', ADMIN_CREDENTIALS.email);
      console.log('--------------------------------------------------');
      console.log('ADMIN LOGIN CREDENTIALS:');
      console.log('Email   :', ADMIN_CREDENTIALS.email);
      console.log('Password:', ADMIN_CREDENTIALS.password);
      console.log('Role    : admin');
      console.log('--------------------------------------------------');
      await mongoose.disconnect();
      process.exit(0);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(ADMIN_CREDENTIALS.password, salt);

    const adminUser = new User({
      ...ADMIN_CREDENTIALS,
      password: hashedPassword,
    });

    await adminUser.save();

    console.log('🎉 Default Administrator created successfully!');
    console.log('==================================================');
    console.log('ADMIN LOGIN CREDENTIALS:');
    console.log('Email   :', ADMIN_CREDENTIALS.email);
    console.log('Password:', ADMIN_CREDENTIALS.password);
    console.log('Role    : admin');
    console.log('==================================================');

    await mongoose.disconnect();
    process.exit(0);
  } catch (seedErr) {
    console.error('❌ Error during seeding:', seedErr.message);
    await mongoose.disconnect();
    process.exit(1);
  }
}

seedAdmin();
