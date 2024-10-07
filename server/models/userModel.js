const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    username: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    portfolio: { type: [Number], default: [] }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
