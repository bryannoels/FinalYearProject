"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const app_1 = __importDefault(require("./app"));
const port = Number(process.env.PORT) || 3000;
const uri = process.env.MONGO_USER_URI || '';
console.log(`Connecting to database at ${uri}`);
mongoose_1.default.connect(uri)
    .then(() => {
    console.log('Connected to database');
    app_1.default.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });
})
    .catch(() => {
    console.log('Connection failed');
});
