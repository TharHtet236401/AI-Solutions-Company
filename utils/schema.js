import Joi from "joi";

// Define the password pattern once to ensure consistency
const passwordPattern = /^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[@#$%&*\-_=+<>[\]{}|\\/'`~^:;?!"(),.]).*$/;

const passwordMessages = {
  "string.min": "Password must be at least 9 characters long",
  "string.pattern.base": 
    "Password must contain at least one uppercase letter (A-Z), one lowercase letter (a-z), one number (0-9), and one special character"
};

export const UserSchema = {
  register: Joi.object({
    username: Joi.string().min(3).max(100).required(),
    email: Joi.string()
      .trim()
      .pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
      .required()
      .messages({
        "string.empty": "Email is required",
        "string.pattern.base":
          "Wrong email format, sample format: johndoe@gmail.com",
      }),
    password: Joi.string()
      .min(9)
      .max(30)
      .required()
      .pattern(passwordPattern)
      .messages(passwordMessages),
    confirmPassword: Joi.string()
      .valid(Joi.ref("password"))
      .required()
      .messages({
        "any.only": "Password and Confirm Password do not match.",
      }),
    "g-recaptcha-response": Joi.string().required(),
  }),
  login: Joi.object({
    email: Joi.string()
      .pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
      .required(),
    password: Joi.string()
      .min(9)
      .max(30)
      .required(),
    "g-recaptcha-response": Joi.string().required(),
  }),
  changePassword: Joi.object({
    oldPassword: Joi.string()
      .min(9)
      .max(30)
      .required()
      .pattern(passwordPattern)
      .messages(passwordMessages),
    newPassword: Joi.string()
      .min(9)
      .max(30)
      .required()
      .pattern(passwordPattern)
      .messages(passwordMessages),
    confirmPassword: Joi.string()
      .valid(Joi.ref("newPassword"))
      .required()
      .messages({
        "any.only": "New Password and Confirm Password do not match.",
      }),
    authenticatorCode: Joi.string().length(6).required(),
  }),
  resetPassword: Joi.object({
    password: Joi.string()
      .min(9)
      .max(30)
      .required()
      .pattern(passwordPattern)
      .messages(passwordMessages),

    confirmPassword: Joi.string()
      .valid(Joi.ref("password"))
      .required()
      .messages({
        "any.only": "Password and Confirm Password do not match.",
      }),
  }),
};
