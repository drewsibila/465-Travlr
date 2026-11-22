const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

// Always use a fresh test database. Never drop or seed the normal travlr database.
const uri = new URL(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/travlr');
uri.pathname = `/travlr_module4_test_${process.pid}_${Date.now()}`;
process.env.MONGODB_URI = uri.toString();
const { mongoose, connectDatabase, disconnectDatabase } = require('../app_server/models/db');
const { seedTrips } = require('../app_server/models/seed');
const { verifyTrips } = require('../app_server/models/verify');
const Trip = require('../app_server/models/travlr');
const { checkRendering } = require('./rendering');
const app = require('../app');
const samples = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/trips.json'), 'utf8'));
let server;
(async () => {
  try {
    await connectDatabase();
    await seedTrips();
    assert.equal(await Trip.countDocuments(), 3);
    await seedTrips();
    assert.equal(await Trip.countDocuments(), 3, 'reseeding does not create duplicates');
    await verifyTrips();
    const indexes = await Trip.collection.indexes();
    assert(indexes.some(index => index.key.code === 1));
    assert(indexes.some(index => index.key.name === 1));
    const stored = await Trip.findOne({ code: samples[0].code }).lean().exec();
    assert(stored.start instanceof Date);
    await assert.rejects(Trip.create({ name: 'Incomplete trip' }), { name: 'ValidationError' });
    const before = await Trip.countDocuments();
    assert.equal(before, 3, 'invalid insert cannot enter MongoDB');

    server = app.listen(0, '127.0.0.1');
    await new Promise(resolve => server.once('listening', resolve));
    const origin = `http://127.0.0.1:${server.address().port}`;
    await checkRendering(origin);
    // Prove that the customer page reads the live database, not trips.json.
    const proof = await Trip.create({
      ...samples[0], code: 'DATABASE_PROOF', name: 'Database Only Trip',
      description: '<p>Added only to MongoDB during testing.</p>'
    });
    let response = await fetch(origin + '/travel');
    assert.equal(response.status, 200);
    let html = await response.text();
    assert(html.includes('Database Only Trip') && html.includes('Added only to MongoDB during testing.'));
    await Trip.deleteOne({ _id: proof._id });
    html = await (await fetch(origin + '/travel')).text();
    assert(!html.includes('Database Only Trip'));

    await disconnectDatabase();
    response = await fetch(origin + '/travel');
    assert.equal(response.status, 503, 'unavailable database returns an error, not stale JSON');
    await connectDatabase();
    assert.equal((await fetch(origin + '/travel')).status, 200);
    console.log('PASS: real MongoDB seeding/reseeding, JSON retrieval, BSON dates, persisted indexes, validation, database-driven HBS, connection failure, and recovery.');
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  } finally {
    if (server) await new Promise(resolve => server.close(resolve));
    try {
      if (mongoose.connection.readyState === 1) await mongoose.connection.dropDatabase();
    } finally { await disconnectDatabase(); }
  }
})();
