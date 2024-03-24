const mongoose = require('mongoose');
require('dotenv').config();
const mongodbUri = process.env.MONGO_URI;

mongoose
  .connect(mongodbUri, {
    useNewUrlParser: true,
  })
  .then(() => {
    console.log('Mongo connected');
  })
  .catch((err) => {
    console.error('Error While Connecting to mongodb', err);
    process.exit(-1);
  });
