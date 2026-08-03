const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const atlasUri = 'mongodb+srv://pruthvishetty04_db_user:goE1ccCKwCi57cjZ@cybercrime.jqahxez.mongodb.net/cybercrime_db?retryWrites=true&w=majority&appName=CyberCrime';

async function updatePassword() {
  try {
    await mongoose.connect(atlasUri);
    const User = require('../src/models/User');
    
    // Find or create pruthvishetty04@gmail.com with admin role & verified
    const hashedPassword = await bcrypt.hash('Admin@123456', 12);
    
    let user = await User.findOne({ email: 'pruthvishetty04@gmail.com' });
    if (user) {
      user.password = hashedPassword;
      user.role = 'admin';
      user.isVerified = true;
      user.isActive = true;
      user.loginAttempts = 0;
      user.lockUntil = undefined;
      await user.save({ validateBeforeSave: false });
      console.log('✅ pruthvishetty04@gmail.com updated with password: Admin@123456 and role: admin');
    } else {
      user = await User.create({
        name: 'Pruthvi Shetty',
        email: 'pruthvishetty04@gmail.com',
        password: hashedPassword,
        role: 'admin',
        isVerified: true,
        isActive: true,
        phone: '9876543210'
      });
      console.log('✅ pruthvishetty04@gmail.com created as admin!');
    }
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

updatePassword();
