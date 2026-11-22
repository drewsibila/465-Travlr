const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Trip = require('../app_server/models/travlr');

(async () => {
  const samples = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/trips.json'), 'utf8'));
  const required = ['code', 'name', 'length', 'start', 'resort', 'perPerson', 'image', 'description'];
  assert.equal(samples.length, 3);
  assert.equal(Trip.collection.name, 'trips');
  for (const sample of samples) {
    await new Trip(sample).validate();
    for (const field of required) {
      const invalid = { ...sample };
      delete invalid[field];
      await assert.rejects(new Trip(invalid).validate(), error => Boolean(error.errors[field]));
    }
  }
  await assert.rejects(new Trip({ ...samples[0], start: 'not-a-date' }).validate(), error => Boolean(error.errors.start));
  await assert.rejects(new Trip({ ...samples[0], perPerson: '-10.00' }).validate(), error => Boolean(error.errors.perPerson));
  const indexes = Trip.schema.indexes();
  assert(indexes.some(([fields]) => fields.code === 1));
  assert(indexes.some(([fields]) => fields.name === 1));
  console.log('PASS: three seed records, eight required fields, date casting, price validation, collection name, and code/name indexes.');
})().catch(error => { console.error(error); process.exitCode = 1; });
