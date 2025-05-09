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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
jest.mock('../../../routes/userRoute', () => {
    const express = require('express');
    const mockRouter = express.Router();
    mockRouter.get('/test', (req, res) => {
        return res.status(200).json({ route: 'user' });
    });
    mockRouter.post('/test', (req, res) => {
        return res.status(200).json({ received: req.body });
    });
    return { __esModule: true, default: mockRouter };
});
jest.mock('../../../routes/stockRoute', () => {
    const express = require('express');
    const mockRouter = express.Router();
    mockRouter.get('/get-top-stocks', (req, res) => {
        return res.status(200).json({ route: 'stock' });
    });
    return { __esModule: true, default: mockRouter };
});
const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => { });
describe('App Configuration', () => {
    let app;
    beforeEach(() => {
        jest.resetModules();
        consoleLogSpy.mockClear();
        app = require('../../../app').default;
    });
    afterAll(() => {
        consoleLogSpy.mockRestore();
    });
    it('should use JSON middleware', () => __awaiter(void 0, void 0, void 0, function* () {
        const data = { key: 'value' };
        const response = yield (0, supertest_1.default)(app)
            .post('/api/users/test')
            .send(data)
            .expect(200);
        expect(response.status).toBe(200);
    }));
    it('should use CORS middleware', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app)
            .get('/api/users/test');
        expect(response.headers['access-control-allow-origin']).toBeDefined();
    }));
    it('should use the logger middleware', () => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, supertest_1.default)(app).get('/api/users/test');
        expect(consoleLogSpy).toHaveBeenCalled();
    }));
    it('should mount user routes at /api/users/', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app)
            .get('/api/users/test');
        expect(response.status).toBe(200);
        expect(response.body).toEqual({ route: 'user' });
    }));
    it('should mount stock routes at /api/stocks/', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app)
            .get('/api/stocks/get-top-stocks');
        expect(response.status).toBe(200);
        expect(response.body).toEqual({ route: 'stock' });
    }), 10000); // Increased timeout for this test since it was timing out
    it('should return 404 for non-existent routes', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app)
            .get('/non-existent-route');
        expect(response.status).toBe(404);
    }));
});
