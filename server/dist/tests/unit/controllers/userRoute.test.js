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
const express_1 = __importDefault(require("express"));
const mockGetAllUsers = jest.fn((req, res, next) => {
    res.status(200).json([]);
});
const mockCreateUser = jest.fn((req, res, next) => {
    res.status(201).json(Object.assign(Object.assign({}, req.body), { id: 'new-id' }));
});
const mockUpdateUser = jest.fn((req, res, next) => {
    res.status(200).json(Object.assign(Object.assign({}, req.body), { id: req.params.id }));
});
const mockDeleteUser = jest.fn((req, res, next) => {
    res.status(200).json({ message: `User ${req.params.id} deleted` });
});
jest.mock('../../../controllers/userController', () => ({
    getAllUsers: mockGetAllUsers,
    createUser: mockCreateUser,
    updateUser: mockUpdateUser,
    deleteUser: mockDeleteUser
}));
describe('User Routes', () => {
    let app;
    beforeAll(() => {
        app = (0, express_1.default)();
        app.use(express_1.default.json());
        const router = require('../../../routes/userRoute').default;
        app.use('/users', router);
    });
    beforeEach(() => {
        jest.clearAllMocks();
    });
    it('should call getAllUsers for GET /users', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app).get('/users');
        expect(response.status).toBe(200);
        expect(mockGetAllUsers).toHaveBeenCalledTimes(1);
    }));
    it('should call createUser for POST /users', () => __awaiter(void 0, void 0, void 0, function* () {
        const userData = { name: 'John Doe', email: 'john.doe@example.com' };
        const response = yield (0, supertest_1.default)(app)
            .post('/users')
            .send(userData);
        expect(response.status).toBe(201);
        expect(mockCreateUser).toHaveBeenCalledTimes(1);
        expect(mockCreateUser.mock.calls[0][0].body).toEqual(userData);
    }));
    it('should call updateUser for PUT /users/:id', () => __awaiter(void 0, void 0, void 0, function* () {
        const userId = '123';
        const updatedUserData = { name: 'Jane Doe' };
        const response = yield (0, supertest_1.default)(app)
            .put(`/users/${userId}`)
            .send(updatedUserData);
        expect(response.status).toBe(200);
        expect(mockUpdateUser).toHaveBeenCalledTimes(1);
        expect(mockUpdateUser.mock.calls[0][0].params.id).toBe(userId);
        expect(mockUpdateUser.mock.calls[0][0].body).toEqual(updatedUserData);
    }));
    it('should call deleteUser for DELETE /users/:id', () => __awaiter(void 0, void 0, void 0, function* () {
        const userId = '456';
        const response = yield (0, supertest_1.default)(app)
            .delete(`/users/${userId}`);
        expect(response.status).toBe(200);
        expect(mockDeleteUser).toHaveBeenCalledTimes(1);
        expect(mockDeleteUser.mock.calls[0][0].params.id).toBe(userId);
    }));
});
