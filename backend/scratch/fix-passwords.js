const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const atlasUri = 'mongodb+srv://pruthvishetty04_db_user:goE1ccCKwCi57cjZ@cybercrime.jqahxez.mongodb.net/cybercrime_db?retryWrites=true&w=majority&appName=CyberCrime';

async function fixPasswords() {
  try {
    await mongoose.connect(atlasUri);
    const User = require('../src/models/User');
    
    const emails = ['pruthvishetty04@gmail.com', 'admin@cybercrime.gov'];
    
    for (const email of emails) {
      let user = await User.findOne({ email });
      if (!user) {
        user = new User({
          name: email.includes('admin') ? 'System Admin' : 'Pruthvi Shetty',
          email,
          role: 'admin',
          isVerified: true,
          isActive: true,
          phone: '9876543210'
        });
      }
      
      // Assign PLAIN text password so pre-save hook hashes it ONCE
      user.password = 'Admin@123456';
      user.role = 'admin';
      user.isVerified = true;
      user.isActive = true;
      user.loginAttempts = 0;
      user.lockUntil = undefined;
      
      await user.save();
      
      // Test comparison immediately
      const freshUser = await User.findOne({ email }).select('+password');
      const matches = await bcrypt.compare('Admin@123456', freshUser.password);
      console.log(`User ${email}: password valid? => ${matches}`);
    }
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

fixPasswords();
