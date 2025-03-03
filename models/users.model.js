import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    username: String,
    password: String,
    role: {
        type: String,
        enum: ['Super Admin', 'Customer Support', 'Sales', 'Marketing','Content', 'Accounting', 'Executive'],
        default: 'Customer Support'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
});

const User = mongoose.model('User', userSchema);

export default User;