import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import {fError} from "./libby.js";
import User from "../models/users.model.js";


dotenv.config();


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
    console.log("token", token);
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select("-password");

      req.user = user;
      next();
    } catch (jwtError) {
      console.log(jwtError);
      fError(res, "Invalid token", 401);
    }
  } catch (error) {
    console.error('Error in validateToken:', error);
    fError(res, "Internal Server Error", 500);
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



