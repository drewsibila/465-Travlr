const mongoose = require('mongoose');

// Module Four schema: the named model explicitly uses the trips collection.
const tripSchema = new mongoose.Schema({
  code: { type: String, required: true, trim: true, index: true },
  name: { type: String, required: true, trim: true, index: true },
  length: { type: String, required: true, trim: true },
  start: { type: Date, required: true },
  resort: { type: String, required: true, trim: true },
  perPerson: {
    type: String, required: true,
    match: [/^\d+(?:\.\d{1,2})?$/, 'perPerson must be a nonnegative decimal amount']
  },
  image: { type: String, required: true },
  description: { type: String, required: true }
}, { collection: 'trips', bufferCommands: false });

module.exports = mongoose.models.trips || mongoose.model('trips', tripSchema);
