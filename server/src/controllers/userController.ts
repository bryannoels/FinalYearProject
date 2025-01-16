import { Request, Response } from 'express';
import User, { IUser } from '../models/userModel';

const getAllUsers = async (req: Request, res: Response): Promise<Response> => {
    try {
        const users = await User.find();
        return res.status(200).json(users);
    } catch (err: any) {
        return res.status(500).json({ error: err.message });
    }
};

const createUser = async (req: Request, res: Response): Promise<Response> => {
    const { username, email, password } = req.body;
    try {
        const user = await User.create({
            username,
            email,
            password,
            portfolio: []
        });
        return res.status(201).json(user);
    } catch (err: any) {
        return res.status(400).json({ error: err.message });
    }
};

const updateUser = async (req: Request, res: Response): Promise<Response> => {
    const { id } = req.params;
    const { username, email, password } = req.body;
    try {
        const user = await User.findByIdAndUpdate(
            id,
            { username, email, password },
            { new: true, runValidators: true }
        );
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        return res.status(200).json(user);
    } catch (err: any) {
        return res.status(400).json({ error: err.message });
    }
};

const deleteUser = async (req: Request, res: Response): Promise<Response> => {
    const { id } = req.params;
    try {
        const user = await User.findByIdAndDelete(id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        return res.status(204).send();
    } catch (err: any) {
        return res.status(400).json({ error: err.message });
    }
};

export { getAllUsers, createUser, updateUser, deleteUser };
