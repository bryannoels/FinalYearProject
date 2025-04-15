import mongoose from 'mongoose';
import app from './app';

const port = process.env.PORT || 3000;

mongoose.connect(process.env.MONGO_URI as string)
  .then(() => {
    console.log('Connected to database');
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch(() => {
    console.log('Connection failed');
  });
