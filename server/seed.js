/**
 * seed.js — Run once to create default admin and user accounts
 * Usage: node seed.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  const accounts = [
    { name: 'Siva', email: 'sivasphotograph@gmail.com', password: '123456', role: 'admin' },
    { name: 'Guest User', email: 'user@lensvault.com', password: 'user123', role: 'user' },
  ];

  for (const acc of accounts) {
    const exists = await User.findOne({ email: acc.email });
    if (!exists) {
      await User.create(acc);
      console.log(`✅ Created ${acc.role}: ${acc.email}`);
    } else {
      console.log(`⚠️  Already exists: ${acc.email}`);
    }
  }

  await mongoose.disconnect();
  console.log('Done!');
};

seed().catch(console.error);
