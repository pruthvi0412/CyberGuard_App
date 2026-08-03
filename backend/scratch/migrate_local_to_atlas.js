const { MongoClient } = require('mongodb');
const dns = require('dns');
require('dotenv').config();

try {
  dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
} catch (e) {}

const LOCAL_URI = process.env.LOCAL_MONGODB_URI || 'mongodb://127.0.0.1:27017';
const ATLAS_URI = process.env.MONGODB_URI || process.env.MONGODB_URI_PROD;
const DB_NAME = 'cybercrime_db';

async function migrate() {
  console.log('--- Starting MongoDB Migration ---');
  console.log('Local MongoDB URI:', LOCAL_URI);
  console.log('Database Name:', DB_NAME);

  const localClient = await MongoClient.connect(LOCAL_URI, { serverSelectionTimeoutMS: 10000 });
  console.log('✅ Connected to Local MongoDB');

  const atlasClient = await MongoClient.connect(ATLAS_URI, { serverSelectionTimeoutMS: 30000 });
  console.log('✅ Connected to MongoDB Atlas');

  const localDb = localClient.db(DB_NAME);
  const atlasDb = atlasClient.db(DB_NAME);

  const collections = await localDb.listCollections().toArray();
  console.log(`\nFound ${collections.length} collection(s) in local "${DB_NAME}":`, collections.map(c => c.name));

  let totalMigrated = 0;

  for (const collInfo of collections) {
    const collName = collInfo.name;
    if (collName.startsWith('system.')) continue;

    const count = await localDb.collection(collName).countDocuments();
    console.log(`\n📦 Migrating [${collName}] (${count} document(s))...`);

    if (count > 0) {
      const docs = await localDb.collection(collName).find({}).toArray();
      
      let inserted = 0;
      let updated = 0;

      for (const doc of docs) {
        try {
          if (collName === 'users') {
            // Upsert by email for users
            const res = await atlasDb.collection(collName).updateOne(
              { email: doc.email },
              { $set: doc },
              { upsert: true }
            );
            if (res.upsertedCount) inserted++;
            else updated++;
          } else {
            // Upsert by _id for complaints, messages, logs, etc.
            const res = await atlasDb.collection(collName).updateOne(
              { _id: doc._id },
              { $set: doc },
              { upsert: true }
            );
            if (res.upsertedCount) inserted++;
            else updated++;
          }
        } catch (itemErr) {
          console.warn(`   ⚠️ Notice on doc ${doc._id}: ${itemErr.message}`);
        }
      }

      console.log(`   ✅ Synced ${collName}: ${inserted} inserted, ${updated} updated (${docs.length} total processed).`);
      totalMigrated += docs.length;
    } else {
      console.log(`   ℹ️ [${collName}] is empty, skipped.`);
    }
  }

  console.log(`\n========================================`);
  console.log(`🎉 ALL DATA MIGRATION COMPLETE!`);
  console.log(`Total documents transferred to Atlas: ${totalMigrated}`);
  console.log(`========================================\n`);

  await localClient.close();
  await atlasClient.close();
  process.exit(0);
}

migrate().catch(err => {
  console.error('Fatal error during migration:', err);
  process.exit(1);
});
