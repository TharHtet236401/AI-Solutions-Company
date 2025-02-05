import bcrypt from "bcrypt";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";

import { readFile } from 'fs/promises';
import { join } from 'path';

dotenv.config();

// you can format the response
export const fMsg = (res, msg, result = {}, statusCode = 200) => {
    return res.status(statusCode).json({ con: true, msg, result });
};

export const fError = (res, msg = "Error", statusCode = 500) => {
    return res.status(statusCode).json({
        con: false,
        msg,
    });
};

//you can encode the password
export const encode = async (payload) => {
    if (!payload) {
        throw new Error("Password is required for encoding");
    }
    return await bcrypt.hash(payload, 12); // Ensure you await the hash function
};

//you can decode the password
export const decode = async (payload, hash) => {
    if (!payload || !hash) {
        throw new Error("Both payload and hash are required for decoding");
    }
    return await bcrypt.compare(payload, hash);
};



// This function generates a JSON Web Token (JWT) for a given user_id and sets it as a cookie in the response.
export const generateTokenAndSetCookie = (res, user_id) => {
    // Sign a JWT with the user_id and a secret key, set to expire in 30 days.
    const token = jwt.sign({ id: user_id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
    // Set the JWT as a cookie in the response, with security features to prevent XSS and ensure it's sent over HTTPS in development.
    res.cookie('jwt', token, {
        httpOnly: true, // prevent XSS
        sameSite: 'strict',
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days in milliseconds
        secure: process.env.NODE_ENV === 'development',
    });

    return token;
};


