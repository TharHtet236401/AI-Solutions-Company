import mongoose from "mongoose";

const unvalidatedInquirySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      "Please enter a valid email address",
    ],
  },
  verificationCode: {
    type: String,
    required: true,
    trim: true,
  },    
  verificationCodeExpiresAt: {
    type: Date,
    required: true,
  },
  verificationCodeSentAt: {
    type: Date,
    required: true,
  },
  phoneNumber: {
    type: String,
    required: true,
    trim: true,
  },
  companyName: {
    type: String,
    required: true,
    trim: true,
  },
  country: {
    type: String,
    required: true,
    trim: true,
  },
  jobTitle: {
    type: String,
    required: true,
    trim: true,
  },
  jobDetails: {
    type: String,
    required: true,
    trim: true,
  },
  status: {
    type: String,
    enum: ["pending", "in-progress", "follow-up", "closed"],
    default: "pending",
  },
  statusResponsedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },

});

const UnvalidatedInquiry = mongoose.model("UnvalidatedInquiry", unvalidatedInquirySchema);

export default UnvalidatedInquiry;
