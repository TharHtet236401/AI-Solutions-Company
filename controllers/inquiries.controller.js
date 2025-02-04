import Inquiry from "../models/inquiries.model.js";
import { fMsg, fError } from "../utils/libby.js";

export const getInquiries = async (req, res) => {
  try { 
    let limit = 10;
    let page = 1;
    let sort = '-createdAt';
    let query = {};
    
    if(req.query.page) {
      page = parseInt(req.query.page);
    }
    if(req.query.limit) {
      limit = parseInt(req.query.limit);
    }
    if(req.query.sort) {
      sort = req.query.sort;
    }
    if(req.query.status && req.query.status !== 'all') {
      query.status = req.query.status;
    }

    // Create sort object
    const sortObj = {};
    const sortField = sort.startsWith('-') ? sort.substring(1) : sort;
    const sortDirection = sort.startsWith('-') ? -1 : 1;
    sortObj[sortField] = sortDirection;

    // Get paginated inquiries
    const inquiries = await Inquiry.find(query)
      .sort(sortObj)
      .skip((page - 1) * limit)
      .limit(limit);

    // Get total count for current query
    const total = await Inquiry.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    // Get counts for all statuses
    const statusCounts = await Inquiry.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Convert to object format
    const counts = {
      pending: 0,
      'in-progress': 0,
      'follow-up': 0,
      closed: 0
    };
    
    statusCounts.forEach(({ _id, count }) => {
      if (_id) counts[_id] = count;
    });

    fMsg(res, "Inquiries fetched successfully", {
      inquiries,
      totalPages,
      total,
      statusCounts: counts
    }, 200);

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

export const replyToInquiry = async (req, res) => {
    try {
        const { id } = req.params;
        const { subject, content } = req.body;
        
        const inquiry = await Inquiry.findById(id);
        if (!inquiry) {
            return fError(res, "Inquiry not found", 404);
        }
        
        // Here you would implement your email sending logic
        // using nodemailer or your preferred email service
        
        // Update inquiry status
        inquiry.status = 'followed-up';
        await inquiry.save();
        
        fMsg(res, "Email sent successfully");
    } catch (error) {
        console.error('Error sending email:', error);
        fError(res, "Error sending email", 500);
    }
};

