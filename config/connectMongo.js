import mongoose from "mongoose";
import dotenv from 'dotenv';
dotenv.config();

export const connectMongo = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected Successfully');
    } catch (error) {
        console.error('MongoDB Connection Error:', error);
        process.exit(1);
    }
}