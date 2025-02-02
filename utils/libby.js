import bcrypt from "bcrypt";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { pwnedPassword } from "hibp";
import { readFile } from 'fs/promises';
import { join } from 'path';

dotenv.config();

// you can format the response
export const fMsg = (res, msg, result = {}, statusCode = 200) => {
    return res.status(statusCode).json({ con: true, msg, result });
};

export const fError = (res, msg, statusCode = 500) => {
    return res.status(statusCode).json({ con: false, msg});
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
};

export const checkPwned = async (password) => {
   try {
    if (!password) return true; // Password is empty or undefined
    const result = await pwnedPassword(password);
    return result > 0; // Returns true if password is compromised, false if it's safe
   } catch (error) {
    console.log(error);
    throw error; // Throw the error to be handled by the calling function
   }
};

export const isDictionaryWord = async (password) => {
    // Extract potential words by splitting on non-letter characters
    const potentialWords = password.split(/[^a-zA-Z]/).filter(word => word.length > 0);
    
    // Convert each potential word to lowercase
    const lowercaseWords = potentialWords.map(word => word.toLowerCase());
    
    // List of CSV files containing dictionary words
    const dictionaryFiles = [
        'CSV Format/A Words.csv',
        'CSV Format/B Words.csv',
        'CSV Format/C Words.csv',
        'CSV Format/D Words.csv',
        'CSV Format/E Words.csv',
        'CSV Format/F Words.csv',
        'CSV Format/G Words.csv',
        'CSV Format/H Words.csv',
        'CSV Format/I Words.csv',
        'CSV Format/J Words.csv',
        'CSV Format/K Words.csv',
        'CSV Format/L Words.csv',
        'CSV Format/M Words.csv',
        'CSV Format/N Words.csv',
        'CSV Format/O Words.csv',
        'CSV Format/P Words.csv',
        'CSV Format/Q Words.csv',
        'CSV Format/R Words.csv',
        'CSV Format/S Words.csv',
        'CSV Format/T Words.csv',
        'CSV Format/U Words.csv',
        'CSV Format/V Words.csv',
        'CSV Format/W Words.csv',
        'CSV Format/X Words.csv',
        'CSV Format/Y Words.csv',
        'CSV Format/Z Words.csv'
    ];

    try {
        // Read each dictionary file and check if any extracted word exists
        for (const file of dictionaryFiles) {
            const text = await readFile(join(process.cwd(), file), 'utf-8');
            const dictionaryWords = text.split('\n').map(word => word.trim().toLowerCase());
            
            // Check if any of our potential words exist in current dictionary
            for (const word of lowercaseWords) {
                if (dictionaryWords.includes(word)) {
                    return true; // Found a dictionary word
                }
            }
        }
        
        return false;
    } catch (error) {
        console.error('Error checking dictionary words:', error);
        return false;
    }
}


