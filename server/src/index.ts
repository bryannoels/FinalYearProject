import dotenv from 'dotenv';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import userRoutes from '../src/routes/userRoute';
import stockRoutes from '../src/routes/stockRoute';
import mongoose from 'mongoose';

dotenv.config();

const app = express();

app.use(express.json());
app.use(cors());

app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(req.path, req.method);
  next();
});

app.use('/api/users/', userRoutes);
app.use('/api/stocks/', stockRoutes);

mongoose.connect(process.env.MONGO_URI as string)
  .then(() => {
    console.log('Connected to database');
  })
  .catch(() => {
    console.log('Connection failed');
  });

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
