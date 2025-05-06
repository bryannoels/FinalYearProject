describe('Database and server connection', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = {
      ...originalEnv,
      MONGO_URI: 'mongodb://localhost/test',
      PORT: '3000',
    };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('should connect to the database and start the server', async () => {
    const mockConnect = jest.fn().mockResolvedValue(undefined);
    const mockListen = jest.fn((port, callback) => callback());
    const mockLog = jest.spyOn(console, 'log').mockImplementation();
  
    jest.doMock('mongoose', () => ({ connect: mockConnect }));
    jest.doMock('../../../app', () => ({
      __esModule: true,
      default: { listen: mockListen },
    }));
  
    await import('../../../index');
  
    expect(mockConnect).toHaveBeenCalledWith('mongodb://localhost/test');
    expect(mockLog).toHaveBeenCalledWith('Connected to database');
    expect(mockListen).toHaveBeenCalledWith(3000, expect.any(Function));
    expect(mockLog).toHaveBeenCalledWith('Server is running on port 3000');
  });
  

  it('should log an error if connection to database fails', async () => {
    const mockConnect = jest.fn().mockRejectedValue(new Error('Connection failed'));
    const mockListen = jest.fn();
    const mockLog = jest.spyOn(console, 'log').mockImplementation();
  
    jest.doMock('mongoose', () => ({ connect: mockConnect }));
    jest.doMock('../../../app', () => ({
      __esModule: true,
      default: { listen: mockListen },
    }));
  
    await jest.isolateModulesAsync(async () => {
      await import('../../../index');
    });
  
    expect(mockConnect).toHaveBeenCalledWith('mongodb://localhost/test');
    expect(mockLog).toHaveBeenCalledWith('Connection failed');
    expect(mockListen).not.toHaveBeenCalled();
  });
  
  
});
