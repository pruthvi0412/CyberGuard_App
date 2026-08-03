const mongoose = require('mongoose');
const User = require('./src/models/User');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/cybercrime_db')
  .then(async () => {
    try {
      const result = await User.deleteMany({ email: { $ne: 'admin@cybercrime.gov' } });
      console.log('Deleted ' + result.deletedCount + ' test users.');
    } catch (e) {
      console.error(e);
    }
    process.exit(0);
  });
