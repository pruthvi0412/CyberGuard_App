const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("../models/User");

dotenv.config();

const seedAdmin = async () => {
  try {
    // 1. Connect using the URI from .env
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB...");

    // 2. Clear any old admin entries to be safe
    await User.deleteMany({ role: "admin" });

    // 3. Create the new admin using .env values
    // IMPORTANT: If your User model hashes passwords in a pre-save hook, 
    // we pass the password as PLAIN TEXT.
    const admin = new User({
      name: "System Admin",
      email: process.env.ADMIN_EMAIL, // pulls admin@cybercrime.gov
      password: process.env.ADMIN_PASSWORD, // pulls Admin@123456
      role: "admin",
      isActive: true,
      isVerified: true
    });

    await admin.save();

    console.log("-----------------------------------------------");
    console.log("Admin seeded successfully!");
    console.log(`Email: ${process.env.ADMIN_EMAIL}`);
    console.log(`Password: ${process.env.ADMIN_PASSWORD}`);
    console.log("-----------------------------------------------");
    
    process.exit();
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
};

seedAdmin();