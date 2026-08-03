const crypto = require('crypto');
const NameMapping = require('../models/NameMapping');
const Counter = require('../models/Counter');

// In-memory cache so repeated lookups for the same name in a request
// don't hit the DB every time. Cleared automatically on process restart.
const cache = new Map();

function normalizeName(name) {
  return name.trim().toLowerCase().replace(/\s+/g, ' ');
}

function hashName(name) {
  const salt = process.env.NAME_MASK_SALT;
  if (!salt) {
    throw new Error('NAME_MASK_SALT is not set in environment variables');
  }
  return crypto.createHash('sha256').update(salt + normalizeName(name)).digest('hex');
}

async function nextPseudonymNumber() {
  const counter = await Counter.findByIdAndUpdate(
    'nameMaskCounter',
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return counter.seq;
}

/**
 * Async, DB-backed masking. Use this for API responses and reports where
 * a human-friendly, stable pseudonym (User_1, User_2...) matters and a
 * DB round trip is acceptable.
 */
async function maskName(realName) {
  if (!realName || typeof realName !== 'string') return realName;

  const hash = hashName(realName);

  if (cache.has(hash)) return cache.get(hash);

  let mapping = await NameMapping.findOne({ nameHash: hash });

  if (!mapping) {
    const num = await nextPseudonymNumber();
    const pseudonym = `User_${num}`;
    try {
      mapping = await NameMapping.create({ nameHash: hash, pseudonym });
    } catch (err) {
      // Two concurrent requests raced to create the same mapping.
      // The unique index means one of them lost — just re-fetch the winner.
      if (err.code === 11000) {
        mapping = await NameMapping.findOne({ nameHash: hash });
      } else {
        throw err;
      }
    }
  }

  cache.set(hash, mapping.pseudonym);
  return mapping.pseudonym;
}

async function maskNames(names = []) {
  return Promise.all(names.map(maskName));
}

/**
 * Sync, hash-derived masking. Use this for logging/audit trails where
 * you cannot await a DB call inline. Deterministic per name, but the
 * pseudonym format (User_a1b2c3) differs from the DB-backed sequential
 * ones — that's fine, logs and API responses don't need to match formats,
 * only be internally consistent.
 */
function maskNameSync(realName) {
  if (!realName || typeof realName !== 'string') return realName;
  const hash = hashName(realName);
  return `User_${hash.slice(0, 6)}`;
}

module.exports = { maskName, maskNames, maskNameSync, hashName };
