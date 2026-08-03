const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);
const mongoose = require('mongoose');

const atlasUri = 'mongodb+srv://pruthvishetty04_db_user:goE1ccCKwCi57cjZ@cybercrime.jqahxez.mongodb.net/cybercrime_db?retryWrites=true&w=majority&appName=CyberCrime';

async function checkUsers() {
  try {
    await mongoose.connect(atlasUri, { serverSelectionTimeoutMS: 10000 });
    const User = require('../src/models/User');
    const users = await User.find({}, 'name email role isVerified');
    console.log('--- Atlas Users ---');
    console.log(JSON.stringify(users, null, 2));
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

checkUsers();
