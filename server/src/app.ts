import dotenv from 'dotenv';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import userRoutes from './routes/userRoute';
import stockRoutes from './routes/stockRoute';

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

export default app;
