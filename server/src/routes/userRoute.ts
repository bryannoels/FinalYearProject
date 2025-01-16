import express, { Request, Response, NextFunction } from 'express';
import { getAllUsers, createUser, updateUser, deleteUser } from '../controllers/userController';

const router = express.Router();

const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next); // catches async errors
  };
};

router.get('/', asyncHandler(getAllUsers));
router.post('/', asyncHandler(createUser));
router.put('/:id', asyncHandler(updateUser));
router.delete('/:id', asyncHandler(deleteUser));

export default router;
