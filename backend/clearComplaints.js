const mongoose = require('mongoose');
const Complaint = require('./src/models/Complaint');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/cybercrime_db')
  .then(async () => {
    try {
      const result = await Complaint.deleteMany({});
      console.log('Deleted ' + result.deletedCount + ' complaints.');
    } catch (e) {
      console.error(e);
    }
    process.exit(0);
  });
