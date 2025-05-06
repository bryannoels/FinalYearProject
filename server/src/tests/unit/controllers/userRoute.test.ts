import request from 'supertest';
import express, { Express } from 'express';
import router from '../../../routes/userRoute';
import * as userControllers from '../../../controllers/userController';

jest.mock('../../../controllers/userController', () => ({
  getAllUsers: jest.fn(),
  createUser: jest.fn(),
  updateUser: jest.fn(),
  deleteUser: jest.fn(),
}));

describe('User Routes', () => {
  let app: Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/users', router);
  });

  it('should call getAllUsers for GET /users', async () => {
    await request(app).get('/users');
    expect(userControllers.getAllUsers).toHaveBeenCalledTimes(1);
  });

  it('should call createUser for POST /users', async () => {
    const userData = { name: 'John Doe', email: 'john.doe@example.com' };
    await request(app)
      .post('/users')
      .send(userData)
      .expect(200);
    expect(userControllers.createUser).toHaveBeenCalledTimes(1);
    expect(userControllers.createUser).toHaveBeenCalledWith(expect.anything(), expect.anything(), expect.any(Function));
  });

  it('should call updateUser for PUT /users/:id', async () => {
    const userId = '123';
    const updatedUserData = { name: 'Jane Doe' };
    await request(app)
      .put(`/users/${userId}`)
      .send(updatedUserData)
      .expect(200);
    expect(userControllers.updateUser).toHaveBeenCalledTimes(1);
    expect(userControllers.updateUser).toHaveBeenCalledWith(
      expect.objectContaining({ params: { id: userId }, body: updatedUserData }),
      expect.anything(),
      expect.any(Function)
    );
  });

  it('should call deleteUser for DELETE /users/:id', async () => {
    const userId = '456';
    await request(app)
      .delete(`/users/${userId}`)
      .expect(200);
    expect(userControllers.deleteUser).toHaveBeenCalledTimes(1);
    expect(userControllers.deleteUser).toHaveBeenCalledWith(
      expect.objectContaining({ params: { id: userId } }),
      expect.anything(),
      expect.any(Function)
    );
  });
});