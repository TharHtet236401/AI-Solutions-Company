import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import {fError} from "./libby.js";
import Auth from "../models/auth.model.js";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import Joi from 'joi';

dotenv.config();

// Remove these lines if you don't need them
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);

//validate the body with schema
export const validateBody = (schema) => {
  return (req, res, next) => {
    let result = schema.validate(req.body);

    if (result.error) {
      fError(res, result.error.details[0].message, 400);
    } else {
      next();
    }
  };
};

export const validateToken = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;
    if (!token) {
      return res.redirect('/auth/views/login');
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await Auth.findById(decoded.id).select("-password");

      if (!user) {
        return res.redirect('/auth/views/login');
      }

      req.user = user;
      // console.log(req.user);
      next();
    } catch (jwtError) {
      // This catch block will handle invalid tokens
      return res.redirect('/auth/views/login');
    }
  } catch (error) {
    console.error('Error in validateToken:', error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export const homeValidate = async (req, res, next) => {
  const token = req.cookies.jwt;
  if (token) {
    return res.redirect('/home/views/home');
  }
  next();
}

export const validateAdmin = async (req, res, next) => {
  const token = req.cookies.jwt;
  if (req.user.role !== "admin" && token) {
    return res.redirect('/home/views/home');
  }
  next();
}

//validate the token with jwt and attach the user info to the request body



