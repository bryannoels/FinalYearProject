import request from 'supertest';
import express, { Express, Request, Response, NextFunction } from 'express';

const mockGetAllUsers = jest.fn((req: Request, res: Response, next: NextFunction) => {
  res.status(200).json([]);
});

const mockCreateUser = jest.fn((req: Request, res: Response, next: NextFunction) => {
  res.status(201).json({ ...req.body, id: 'new-id' });
});

const mockUpdateUser = jest.fn((req: Request, res: Response, next: NextFunction) => {
  res.status(200).json({ ...req.body, id: req.params.id });
});

const mockDeleteUser = jest.fn((req: Request, res: Response, next: NextFunction) => {
  res.status(200).json({ message: `User ${req.params.id} deleted` });
});

jest.mock('../../../controllers/userController', () => ({
  getAllUsers: mockGetAllUsers,
  createUser: mockCreateUser,
  updateUser: mockUpdateUser,
  deleteUser: mockDeleteUser
}));

describe('User Routes', () => {
  let app: Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    const router = require('../../../routes/userRoute').default;
    app.use('/users', router);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call getAllUsers for GET /users', async () => {
    const response = await request(app).get('/users');
    
    expect(response.status).toBe(200);
    expect(mockGetAllUsers).toHaveBeenCalledTimes(1);
  });

  it('should call createUser for POST /users', async () => {
    const userData = { name: 'John Doe', email: 'john.doe@example.com' };
    
    const response = await request(app)
      .post('/users')
      .send(userData);
    
    expect(response.status).toBe(201);
    expect(mockCreateUser).toHaveBeenCalledTimes(1);
    expect(mockCreateUser.mock.calls[0][0].body).toEqual(userData);
  });

  it('should call updateUser for PUT /users/:id', async () => {
    const userId = '123';
    const updatedUserData = { name: 'Jane Doe' };
    
    const response = await request(app)
      .put(`/users/${userId}`)
      .send(updatedUserData);
    
    expect(response.status).toBe(200);
    expect(mockUpdateUser).toHaveBeenCalledTimes(1);
    expect(mockUpdateUser.mock.calls[0][0].params.id).toBe(userId);
    expect(mockUpdateUser.mock.calls[0][0].body).toEqual(updatedUserData);
  });

  it('should call deleteUser for DELETE /users/:id', async () => {
    const userId = '456';
    
    const response = await request(app)
      .delete(`/users/${userId}`);
    
    expect(response.status).toBe(200);
    expect(mockDeleteUser).toHaveBeenCalledTimes(1);
    expect(mockDeleteUser.mock.calls[0][0].params.id).toBe(userId);
  });
});