// testPayment.js
const dotenv = require('dotenv');
dotenv.config();
const mongoose = require('mongoose');
const User = require('./models/User');
const jwt = require('jsonwebtoken');

// --- STEP 1: Connect to DB ---
mongoose.connect(process.env.MONGO_URI).then(async () => {
  console.log('✅ DB connected');

  // --- STEP 2: Find a user (use your existing user email) ---
  const user = await User.findOne({ email: 'mahnoor@gmail.com' });  // 👈 change to your actual user email
  if (!user) {
    console.error('❌ User not found');
    process.exit(1);
  }

  // --- STEP 3: Generate a valid token for that user ---
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });

  // --- STEP 4: Call the confirm-payment route ---
  const fetch = globalThis.fetch || require('node-fetch'); // Node 18+ has fetch
  const BASE_URL = 'http://localhost:5000/api';  // ensure your server is running

  try {
    const res = await fetch(`${BASE_URL}/subscription/confirm-payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ plan: 'pro' }),
    });

    const data = await res.text();
    console.log('Status:', res.status);
    console.log('Response:', data);

    if (res.ok) {
      console.log('✅ Payment confirmation works!');
    } else {
      console.log('❌ Request failed with status', res.status);
      console.log('Full response:', data);
    }
  } catch (error) {
    console.error('❌ Error making request:', error.message);
  }

  process.exit(0);
});