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
const express_1 = __importDefault(require("express"));
const supertest_1 = __importDefault(require("supertest"));
const userController_1 = require("../../../controllers/userController");
const userModel_1 = __importDefault(require("../../../models/userModel"));
// Mock Mongoose Model
jest.mock('../../../models/userModel');
const mockedUserModel = userModel_1.default;
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.get('/users', userController_1.getAllUsers);
app.post('/users', userController_1.createUser);
app.put('/users/:id', userController_1.updateUser);
app.delete('/users/:id', userController_1.deleteUser);
describe('User Controller', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });
    describe('GET /users', () => {
        it('should return all users', () => __awaiter(void 0, void 0, void 0, function* () {
            const users = [{ _id: '1', username: 'test', email: 'test@test.com', password: '123' }];
            mockedUserModel.find.mockResolvedValue(users);
            const res = yield (0, supertest_1.default)(app).get('/users');
            expect(res.status).toBe(200);
            expect(res.body).toEqual(users);
        }));
        it('should handle server error', () => __awaiter(void 0, void 0, void 0, function* () {
            mockedUserModel.find.mockRejectedValue(new Error('Database error'));
            const res = yield (0, supertest_1.default)(app).get('/users');
            expect(res.status).toBe(500);
            expect(res.body).toEqual({ error: 'Database error' });
        }));
    });
    describe('POST /users', () => {
        it('should create a user', () => __awaiter(void 0, void 0, void 0, function* () {
            const newUser = {
                username: 'testuser',
                email: 'test@example.com',
                password: 'password123',
                portfolio: [],
            };
            mockedUserModel.create.mockResolvedValue(newUser);
            const res = yield (0, supertest_1.default)(app).post('/users').send(newUser);
            expect(res.status).toBe(201);
            expect(res.body).toEqual(newUser);
        }));
        it('should return 400 on create error', () => __awaiter(void 0, void 0, void 0, function* () {
            mockedUserModel.create.mockRejectedValue(new Error('Validation error'));
            const res = yield (0, supertest_1.default)(app).post('/users').send({});
            expect(res.status).toBe(400);
            expect(res.body).toEqual({ error: 'Validation error' });
        }));
    });
    describe('PUT /users/:id', () => {
        it('should update user if exists', () => __awaiter(void 0, void 0, void 0, function* () {
            const updatedUser = {
                _id: '1',
                username: 'updated',
                email: 'updated@test.com',
                password: 'newpass',
            };
            mockedUserModel.findByIdAndUpdate.mockResolvedValue(updatedUser);
            const res = yield (0, supertest_1.default)(app).put('/users/1').send(updatedUser);
            expect(res.status).toBe(200);
            expect(res.body).toEqual(updatedUser);
        }));
        it('should return 404 if user not found', () => __awaiter(void 0, void 0, void 0, function* () {
            mockedUserModel.findByIdAndUpdate.mockResolvedValue(null);
            const res = yield (0, supertest_1.default)(app).put('/users/123').send({});
            expect(res.status).toBe(404);
            expect(res.body).toEqual({ error: 'User not found' });
        }));
        it('should return 400 on update error', () => __awaiter(void 0, void 0, void 0, function* () {
            mockedUserModel.findByIdAndUpdate.mockRejectedValue(new Error('Update error'));
            const res = yield (0, supertest_1.default)(app).put('/users/1').send({});
            expect(res.status).toBe(400);
            expect(res.body).toEqual({ error: 'Update error' });
        }));
    });
    describe('DELETE /users/:id', () => {
        it('should delete user if exists', () => __awaiter(void 0, void 0, void 0, function* () {
            mockedUserModel.findByIdAndDelete.mockResolvedValue({ _id: '1' });
            const res = yield (0, supertest_1.default)(app).delete('/users/1');
            expect(res.status).toBe(204);
        }));
        it('should return 404 if user not found', () => __awaiter(void 0, void 0, void 0, function* () {
            mockedUserModel.findByIdAndDelete.mockResolvedValue(null);
            const res = yield (0, supertest_1.default)(app).delete('/users/123');
            expect(res.status).toBe(404);
            expect(res.body).toEqual({ error: 'User not found' });
        }));
        it('should return 400 on delete error', () => __awaiter(void 0, void 0, void 0, function* () {
            mockedUserModel.findByIdAndDelete.mockRejectedValue(new Error('Delete error'));
            const res = yield (0, supertest_1.default)(app).delete('/users/1');
            expect(res.status).toBe(400);
            expect(res.body).toEqual({ error: 'Delete error' });
        }));
    });
});
