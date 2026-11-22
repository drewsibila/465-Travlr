const mongoose = require('mongoose');
require('./travlr');

const databaseURI = () => process.env.MONGODB_URI ||
  `mongodb://${process.env.DB_HOST || '127.0.0.1'}:27017/travlr`;

// Initial rejection is handled by the caller; events report later failures too.
mongoose.connection.on('connected', () => console.log('Mongoose connected'));
mongoose.connection.on('error', err => console.error('Mongoose connection error:', err.message));
mongoose.connection.on('disconnected', () => console.log('Mongoose disconnected'));

const connectDatabase = async () => {
  if (mongoose.connection.readyState === 1) return mongoose;
  await mongoose.connect(databaseURI(), { serverSelectionTimeoutMS: 5000 });
  return mongoose;
};

const disconnectDatabase = async () => {
  await mongoose.disconnect();
};

module.exports = { mongoose, databaseURI, connectDatabase, disconnectDatabase };
