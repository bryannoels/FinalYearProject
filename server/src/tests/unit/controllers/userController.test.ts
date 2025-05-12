import express from 'express';
import request from 'supertest';
import mongoose from 'mongoose';
import { getAllUsers, createUser, updateUser, deleteUser } from '../../../controllers/userController';
import User from '../../../models/userModel';

jest.mock('../../../models/userModel');

const mockedUserModel = User as jest.Mocked<typeof User>;

const app = express();
app.use(express.json());
app.get('/users', getAllUsers);
app.post('/users', createUser);
app.put('/users/:id', updateUser);
app.delete('/users/:id', deleteUser);

describe('User Controller', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /users', () => {
    it('should return all users', async () => {
      const users = [{ _id: '1', username: 'test', email: 'test@test.com', password: '123' }];
      mockedUserModel.find.mockResolvedValue(users);

      const res = await request(app).get('/users');
      expect(res.status).toBe(200);
      expect(res.body).toEqual(users);
    });

    it('should handle server error', async () => {
      mockedUserModel.find.mockRejectedValue(new Error('Database error'));

      const res = await request(app).get('/users');
      expect(res.status).toBe(500);
      expect(res.body).toEqual({ error: 'Database error' });
    });
  });

  describe('POST /users', () => {
    it('should create a user', async () => {
      const newUser = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        portfolio: [],
      };
      mockedUserModel.create.mockResolvedValue(newUser as any);

      const res = await request(app).post('/users').send(newUser);
      expect(res.status).toBe(201);
      expect(res.body).toEqual(newUser);
    });

    it('should return 400 on create error', async () => {
      mockedUserModel.create.mockRejectedValue(new Error('Validation error'));

      const res = await request(app).post('/users').send({});
      expect(res.status).toBe(400);
      expect(res.body).toEqual({ error: 'Validation error' });
    });
  });

  describe('PUT /users/:id', () => {
    it('should update user if exists', async () => {
      const updatedUser = {
        _id: '1',
        username: 'updated',
        email: 'updated@test.com',
        password: 'newpass',
      };
      mockedUserModel.findByIdAndUpdate.mockResolvedValue(updatedUser as any);

      const res = await request(app).put('/users/1').send(updatedUser);
      expect(res.status).toBe(200);
      expect(res.body).toEqual(updatedUser);
    });

    it('should return 404 if user not found', async () => {
      mockedUserModel.findByIdAndUpdate.mockResolvedValue(null);

      const res = await request(app).put('/users/123').send({});
      expect(res.status).toBe(404);
      expect(res.body).toEqual({ error: 'User not found' });
    });

    it('should return 400 on update error', async () => {
      mockedUserModel.findByIdAndUpdate.mockRejectedValue(new Error('Update error'));

      const res = await request(app).put('/users/1').send({});
      expect(res.status).toBe(400);
      expect(res.body).toEqual({ error: 'Update error' });
    });
  });

  describe('DELETE /users/:id', () => {
    it('should delete user if exists', async () => {
      mockedUserModel.findByIdAndDelete.mockResolvedValue({ _id: '1' } as any);

      const res = await request(app).delete('/users/1');
      expect(res.status).toBe(204);
    });

    it('should return 404 if user not found', async () => {
      mockedUserModel.findByIdAndDelete.mockResolvedValue(null);

      const res = await request(app).delete('/users/123');
      expect(res.status).toBe(404);
      expect(res.body).toEqual({ error: 'User not found' });
    });

    it('should return 400 on delete error', async () => {
      mockedUserModel.findByIdAndDelete.mockRejectedValue(new Error('Delete error'));

      const res = await request(app).delete('/users/1');
      expect(res.status).toBe(400);
      expect(res.body).toEqual({ error: 'Delete error' });
    });
  });
});
