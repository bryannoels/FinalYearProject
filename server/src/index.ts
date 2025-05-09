import mongoose from 'mongoose';
import app from './app';
import dotenv from 'dotenv';
dotenv.config();

const port = Number(process.env.PORT) || 3000;
const uri = process.env.MONGO_USER_URI || '';

console.log(`Connecting to database at ${uri} and port ${port}`);

mongoose.connect(uri)
  .then(() => {
    console.log('Connected to database');
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch(() => {
    console.log(`Connection to ${uri} failed`);
  });
