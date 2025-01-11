import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
    username: string;
    email: string;
    password: string;
    portfolio: any[];
}

const userSchema: Schema = new Schema({
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    portfolio: { type: Array, default: [] }
});

const User = mongoose.model<IUser>('User', userSchema);

export default User;
