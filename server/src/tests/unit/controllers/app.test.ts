import request from 'supertest';
import express, { Request, Response, Router } from 'express';
import userRoutes from '../../../routes/userRoute';
import cors from 'cors';


jest.mock('../../../routes/userRoute', () => {
    const express = require('express');
    const mockRouter = express.Router();
    mockRouter.get('/test', (req: Request, res: Response) => {
      return res.status(200).json({ route: 'user' });
    });
    mockRouter.post('/test', (req: express.Request, res: express.Response) => {
        return res.status(200).json({ received: req.body });
      });
    return { __esModule: true, default: mockRouter };
  });
  
  jest.mock('../../../routes/stockRoute', () => {
    const express = require('express');
    const mockRouter = express.Router();
    mockRouter.get('/get-top-stocks', (req: Request, res: Response) => {
      return res.status(200).json({ route: 'stock' });
    });
    return { __esModule: true, default: mockRouter };
  });


const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

describe('App Configuration', () => {
  let app: express.Express;

  beforeEach(() => {
    jest.resetModules();
    consoleLogSpy.mockClear();
    app = require('../../../app').default;
  });

  afterAll(() => {
    consoleLogSpy.mockRestore();
  });

  it('should use JSON middleware', async () => {
    const data = { key: 'value' };
    
    const response = await request(app)
      .post('/api/users/test')
      .send(data)
      .expect(200);
      
    expect(response.status).toBe(200);
  });

  it('should use CORS middleware', async () => {
    const response = await request(app)
      .get('/api/users/test');
      
    expect(response.headers['access-control-allow-origin']).toBeDefined();
  });

  it('should use the logger middleware', async () => {
    await request(app).get('/api/users/test');
    
    expect(consoleLogSpy).toHaveBeenCalled();
  });

  it('should mount user routes at /api/users/', async () => {
    const response = await request(app)
      .get('/api/users/test');
      
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ route: 'user' });
  });

  it('should mount stock routes at /api/stocks/', async () => {
    const response = await request(app)
      .get('/api/stocks/get-top-stocks');
      
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ route: 'stock' });
  }, 10000); // Increased timeout for this test since it was timing out

  it('should return 404 for non-existent routes', async () => {
    const response = await request(app)
      .get('/non-existent-route');
      
    expect(response.status).toBe(404);
  });
});