import Inquiry from "../models/inquiries.model.js";
import { fMsg, fError } from "../utils/libby.js";

export const getInquiries = async (req, res) => {
  try {
    const inquiries = await Inquiry.find();
    fMsg(res, "Inquiries fetched successfully", inquiries, 200);
  } catch (error) {
    fError(res, "Error fetching inquiries", 500);
  }
};

export const getInquiry = async (req, res) => {
  try {
    const inquiry = await Inquiry.findById(req.params.id);
    if (!inquiry) {
      fError(res, "Inquiry not found", 404);
      return;
    }
    fMsg(res, "Inquiry fetched successfully", inquiry, 200);
  } catch (error) {
    fError(res, "Error fetching inquiry", 500);
  }
};

export const createInquiry = async (req, res) => {
  try {
    const {
      name,
      email,
      phoneNumber,
      companyName,
      country,
    jobTitle,
    jobDetails,
    status,
  } = req.body;
  if (
    !name ||
    !email ||
    !phoneNumber ||
    !companyName ||
    !country ||
    !jobTitle ||
    !jobDetails
  ) {
    fError(res, "All fields are required", 400);
    return;
  }
  const inquiry = new Inquiry({
    name,
    email,
    phoneNumber,
    companyName,
    country,
    jobTitle,
    jobDetails,
    status,
    });
    await inquiry.save();
    fMsg(res, "Inquiry created successfully",inquiry,201);
  } catch (error) {
    fError(res, "Error creating inquiry", 500);
  }
};

export const deleteInquiry = async (req, res) => {
  try {
    const { id } = req.params;
    await Inquiry.findByIdAndDelete(id);
    fMsg(res, "Inquiry deleted successfully", 200);
  } catch (error) {
    fError(res, "Error deleting inquiry", 500);
  }
};

export const updateInquiryStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updatedInquiry = await Inquiry.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!updatedInquiry) {
      fError(res, "Inquiry not found", 404);
      return;
    }

    fMsg(res, updatedInquiry, 200);
  } catch (error) {
    fError(res, "Error updating inquiry status", 500);
  }
};

