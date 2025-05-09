"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
describe('Database and server connection', () => {
    const originalEnv = process.env;
    const mockListen = jest.fn((port, callback) => callback());
    const mockLog = jest.spyOn(console, 'log').mockImplementation();
    beforeEach(() => {
        jest.resetModules();
        process.env = Object.assign(Object.assign({}, originalEnv), { MONGO_USER_URI: 'mongodb://localhost/test', PORT: '3000' });
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
    it('should connect to the database and start the server', () => __awaiter(void 0, void 0, void 0, function* () {
        const mockConnect = jest.fn();
        jest.doMock('mongoose', () => ({
            connect: mockConnect.mockResolvedValue(undefined),
        }));
        yield jest.isolateModulesAsync(() => __awaiter(void 0, void 0, void 0, function* () {
            require('../../../index');
        }));
        expect(mockConnect).toHaveBeenCalledWith('mongodb://localhost/test');
        expect(mockLog).toHaveBeenCalledWith('Connected to database');
        expect(mockLog).toHaveBeenCalledWith('Server is running on port 3000');
    }));
    it('should log an error if connection to database fails', () => __awaiter(void 0, void 0, void 0, function* () {
        const mockConnectFailed = jest.fn().mockRejectedValue(new Error('Connection failed'));
        jest.doMock('mongoose', () => ({
            connect: mockConnectFailed,
        }));
        yield jest.isolateModulesAsync(() => __awaiter(void 0, void 0, void 0, function* () {
            require('../../../index');
        }));
        expect(mockConnectFailed).toHaveBeenCalledWith('mongodb://localhost/test');
        expect(mockLog).toHaveBeenCalledWith('Connection failed');
    }));
    it('should use default PORT (empty string) when PORT is undefined', () => __awaiter(void 0, void 0, void 0, function* () {
        const mockConnect = jest.fn().mockResolvedValue(undefined);
        jest.doMock('mongoose', () => ({
            connect: mockConnect,
        }));
        delete process.env.PORT;
        yield jest.isolateModules(() => __awaiter(void 0, void 0, void 0, function* () {
            require('../../../index');
        }));
        expect(mockConnect).toHaveBeenCalledWith('mongodb://localhost/test');
        expect(mockLog).toHaveBeenCalledWith('Connected to database');
    }));
    it('should use default MONGO_URI (empty string) when MONGO_URI is undefined', () => __awaiter(void 0, void 0, void 0, function* () {
        const mockConnect = jest.fn().mockResolvedValue(undefined);
        jest.doMock('mongoose', () => ({
            connect: mockConnect,
        }));
        process.env.PORT = '3000';
        delete process.env.MONGO_USER_URI;
        yield jest.isolateModules(() => __awaiter(void 0, void 0, void 0, function* () {
            require('../../../index');
        }));
        expect(mockConnect).toHaveBeenCalledWith('');
        expect(mockLog).toHaveBeenCalledWith('Connected to database');
    }));
});
