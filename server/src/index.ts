import mongoose from 'mongoose';
import app from './app';

const port = Number(process.env.PORT) || 3000;
const uri = process.env.MONGO_URI || '';

console.log(`Connecting to database at ${uri}`);

mongoose.connect(uri)
  .then(() => {
    console.log('Connected to database');
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch(() => {
    console.log('Connection failed');
  });
