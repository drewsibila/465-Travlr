const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { connectDatabase, disconnectDatabase } = require('./db');
const Trip = require('./travlr');

async function verifyTrips() {
  await connectDatabase();
  const expected = JSON.parse(fs.readFileSync(path.join(__dirname, '../../data/trips.json'), 'utf8'));
  const documents = await Trip.find({}).sort({ code: 1 }).lean().exec();
  assert.equal(documents.length, expected.length, 'Run npm run seed to load the sample trips');
  for (const sample of expected) {
    const stored = documents.find(trip => trip.code === sample.code);
    assert(stored, `Missing trip ${sample.code}`);
    for (const key of ['name', 'length', 'resort', 'perPerson', 'image', 'description']) {
      assert.equal(stored[key], sample[key], `Mismatch in ${sample.code}.${key}`);
    }
    assert(stored.start instanceof Date, 'start must be stored as a BSON date');
    assert.equal(stored.start.toISOString(), new Date(sample.start).toISOString());
  }
  const json = JSON.parse(JSON.stringify(documents));
  assert(json.every(trip => typeof trip._id === 'string' && typeof trip.start === 'string'));
  console.log(JSON.stringify(json, null, 2));
  console.log(`Verified ${documents.length} MongoDB trip documents and JSON serialization.`);
  return documents;
}
if (require.main === module) {
  (async () => {
    try { await verifyTrips(); }
    catch (err) { console.error('Verification failed:', err.message); process.exitCode = 1; }
    finally { await disconnectDatabase(); }
  })();
}
module.exports = { verifyTrips };
