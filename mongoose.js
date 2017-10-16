const mongoose = require('mongoose');

const url = process.env.MONGO_DB || 'mongodb://localhost:27017/keyword-crawler';

let initialized = false;

mongoose.Promise = Promise;

mongoose.set('debug', process.env.NODE_ENV === 'development');

const connect = () => mongoose.connect(url, {
  reconnectTries: Number.MAX_VALUE,
  useMongoClient: true,
}).then((conn) => {
  initialized = true;
  return conn;
});

mongoose.connection.on('connected', () => console.log(`Mongoose default connection open to ${url}`));

mongoose.connection.on('error', err => initialized && console.error(`Mongoose default connection error: ${err}`));

mongoose.connection.on('disconnected', () => {
  if (initialized) {
    console.log('Mongoose default connection disconnected');
    console.log(`Reconnecting in ${process.env.RECONNECTION_INTERVAL / 1000} seconds`);

    setTimeout(() => connect(), process.env.RECONNECTION_INTERVAL);
  }
});

mongoose.connection.once('open', () => console.log('Mongoose default connection is open'));

process.on('SIGINT', () => {
  mongoose.connection.close(() => {
    console.error('Mongoose default connection disconnected through app termination');
    process.exit(0);
  });
});

module.exports = connect();
