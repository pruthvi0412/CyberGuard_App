const mongoose = require('mongoose');
require('dotenv').config();

const test = async () => {
  const uri = 'mongodb://localhost:27017/cybercrime_db';
  console.log('Testing connection to:', uri);
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    console.log('✅ Connection successful!');
    
    const User = require('../src/models/User');
    const Complaint = require('../src/models/Complaint');
    
    const users = await User.find().limit(10);
    console.log('👤 Users in localhost:');
    users.forEach(u => {
      console.log(`- [${u._id}] ${u.name} (${u.email}) Role: ${u.role}`);
    });

    process.exit(0);
  } catch (err) {
    console.error('❌ Connection failed:', err.message);
    process.exit(1);
  }
};

test();
