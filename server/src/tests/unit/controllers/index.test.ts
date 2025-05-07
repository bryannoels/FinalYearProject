describe('Database and server connection', () => {
  const originalEnv = process.env;
  
  const mockListen = jest.fn((port, callback) => callback());
  const mockLog = jest.spyOn(console, 'log').mockImplementation();

  beforeEach(() => {
    jest.resetModules();
    process.env = {
      ...originalEnv,
      MONGO_URI: 'mongodb://localhost/test',
      PORT: '3000',
    };

    jest.doMock('../../../app', () => ({
      __esModule: true,
      default: { listen: mockListen },
    }));
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should connect to the database and start the server', async () => {
    const mockConnect = jest.fn();
    jest.doMock('mongoose', () => ({
      connect: mockConnect.mockResolvedValue(undefined),
    }));
    await jest.isolateModulesAsync(async () => {
      require('../../../index');
    });
    expect(mockConnect).toHaveBeenCalledWith('mongodb://localhost/test');
    expect(mockLog).toHaveBeenCalledWith('Connected to database');
    expect(mockLog).toHaveBeenCalledWith('Server is running on port 3000');
  });

  it('should log an error if connection to database fails', async () => {
    const mockConnectFailed = jest.fn().mockRejectedValue(new Error('Connection failed'));

    jest.doMock('mongoose', () => ({
      connect: mockConnectFailed,
    }));

    await jest.isolateModulesAsync(async () => {
      require('../../../index');
    });

    expect(mockConnectFailed).toHaveBeenCalledWith('mongodb://localhost/test');
    expect(mockLog).toHaveBeenCalledWith('Connection failed');
  });

  it('should use default PORT (empty string) when PORT is undefined', async () => {
    const mockConnect = jest.fn().mockResolvedValue(undefined);
    jest.doMock('mongoose', () => ({
      connect: mockConnect,
    }));

    delete process.env.PORT;

    await jest.isolateModules(async () => {
      require('../../../index');
    });

    expect(mockConnect).toHaveBeenCalledWith('mongodb://localhost/test');
    expect(mockLog).toHaveBeenCalledWith('Connected to database');
  });

  it('should use default MONGO_URI (empty string) when MONGO_URI is undefined', async () => {
    const mockConnect = jest.fn().mockResolvedValue(undefined);
    jest.doMock('mongoose', () => ({
      connect: mockConnect,
    }));

    process.env.PORT = '3000';
    delete process.env.MONGO_URI;

    await jest.isolateModules(async () => {
      require('../../../index');
    });

    expect(mockConnect).toHaveBeenCalledWith('');
    expect(mockLog).toHaveBeenCalledWith('Connected to database');
  });
});
