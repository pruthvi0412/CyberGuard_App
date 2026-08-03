const mongoose = require('mongoose');

/**
 * Stores ONLY a salted hash of a real name, mapped to a consistent pseudonym.
 * The real name is never persisted here — this table is safe even if it leaks.
 */
const nameMappingSchema = new mongoose.Schema(
  {
    nameHash: { type: String, required: true, unique: true, index: true },
    pseudonym: { type: String, required: true, unique: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('NameMapping', nameMappingSchema);
