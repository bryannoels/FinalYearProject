import mongoose from 'mongoose';
import app from '../../../app';

jest.mock('mongoose');
jest.mock('../../../app');

describe('Database and server connection', () => {
  it('should connect to the database and start the server', async () => {
    const mockListen = jest.fn();
    app.listen = mockListen;

    const mockConnect = jest.fn().mockResolvedValue('Connected to DB');
    mongoose.connect = mockConnect;

    const mockLog = jest.spyOn(console, 'log').mockImplementation();

    await require('../../../index'); 

    expect(mongoose.connect).toHaveBeenCalledWith(process.env.MONGO_URI);
    expect(mockLog).toHaveBeenCalledWith('Connected to database');
    expect(mockListen).toHaveBeenCalledWith(process.env.PORT || 3000, expect.any(Function));
    expect(mockLog).toHaveBeenCalledWith(`Server is running on port ${process.env.PORT || 3000}`);
  });

  it('should log an error if connection to database fails', async () => {
    const mockLog = jest.spyOn(console, 'log').mockImplementation();
    const mockConnect = jest.fn().mockRejectedValue(new Error('Connection failed'));
    mongoose.connect = mockConnect;

    await require('../../../index');

    expect(mongoose.connect).toHaveBeenCalledWith(process.env.MONGO_URI);
    expect(mockLog).toHaveBeenCalledWith('Connection failed');
  });
});
