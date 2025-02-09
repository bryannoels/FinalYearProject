"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userController_1 = require("../controllers/userController");
const router = express_1.default.Router();
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next); // catches async errors
    };
};
router.get('/', asyncHandler(userController_1.getAllUsers));
router.post('/', asyncHandler(userController_1.createUser));
router.put('/:id', asyncHandler(userController_1.updateUser));
router.delete('/:id', asyncHandler(userController_1.deleteUser));
exports.default = router;
