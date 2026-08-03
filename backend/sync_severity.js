const mongoose = require('mongoose');
const dns = require('dns');
const Complaint = require('./src/models/Complaint');

try {
  dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
} catch (_) {}

require('dotenv').config();

const updateSeverities = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to Database...');

    const highCategories = ['financial_fraud', 'hacking', 'ransomware', 'child_exploitation'];
    const lowCategories = ['phishing'];

    // Update High Severity
    const highResult = await Complaint.updateMany(
      { category: { $in: highCategories } },
      { $set: { severity: 'high' } }
    );
    console.log(`Updated ${highResult.modifiedCount} high-priority complaints.`);

    // Update Low Severity
    const lowResult = await Complaint.updateMany(
      { category: { $in: lowCategories } },
      { $set: { severity: 'low' } }
    );
    console.log(`Updated ${lowResult.modifiedCount} low-priority complaints.`);

    console.log('Severity synchronization complete.');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

updateSeverities();
