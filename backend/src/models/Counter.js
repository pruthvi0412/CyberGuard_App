const mongoose = require('mongoose');

/**
 * Generic atomic counter, used to hand out sequential pseudonym numbers
 * (e.g. User_1, User_2, ...) without race conditions on concurrent requests.
 */
const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 },
});

module.exports = mongoose.model('Counter', counterSchema);
