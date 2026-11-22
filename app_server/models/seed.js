const fs = require('fs');
const path = require('path');
const { connectDatabase, disconnectDatabase } = require('./db');
const Trip = require('./travlr');

async function seedTrips() {
  const trips = JSON.parse(fs.readFileSync(path.join(__dirname, '../../data/trips.json'), 'utf8'));
  if (!Array.isArray(trips) || trips.length === 0) throw new Error('Seed data must be a nonempty array');
  // Validate the entire input before replacing any existing course sample trips.
  await Promise.all(trips.map(trip => new Trip(trip).validate()));
  const codes = trips.map(trip => trip.code);
  if (new Set(codes).size !== codes.length) throw new Error('Seed trip codes must be distinct');
  await connectDatabase();
  await Trip.init();
  // Matches the guide: each run replaces the trips collection's records.
  await Trip.deleteMany({});
  const inserted = await Trip.insertMany(trips);
  console.log(`Seeded ${inserted.length} trips into ${Trip.db.name}.trips`);
  return inserted;
}

if (require.main === module) {
  (async () => {
    try { await seedTrips(); }
    catch (err) { console.error('Seeding failed:', err.message); process.exitCode = 1; }
    finally { await disconnectDatabase(); }
  })();
}
module.exports = { seedTrips };
