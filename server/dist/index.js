"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const userRoute_1 = __importDefault(require("../src/routes/userRoute"));
const stockRoute_1 = __importDefault(require("../src/routes/stockRoute"));
const mongoose_1 = __importDefault(require("mongoose"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)());
app.use((req, res, next) => {
    console.log(req.path, req.method);
    next();
});
app.use('/api/users/', userRoute_1.default);
app.use('/api/stocks/', stockRoute_1.default);
mongoose_1.default.connect(process.env.MONGO_URI)
    .then(() => {
    console.log('Connected to database');
})
    .catch(() => {
    console.log('Connection failed');
});
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
