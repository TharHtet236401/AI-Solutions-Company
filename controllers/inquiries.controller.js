import Inquiry from "../models/inquiries.model.js";
import { fMsg, fError } from "../utils/libby.js";
import excel from 'exceljs';
import { Parser } from 'json2csv';

export const getInquiries = async (req, res) => {
  try { 
    let limit = 10;
    let page = 1;
    let sort = '-createdAt';
    let query = {};
    
    // Add search functionality
    if(req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      query.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { companyName: searchRegex },
        { country: searchRegex },
        { jobTitle: searchRegex },
        { jobDetails: searchRegex },
        { phoneNumber: searchRegex }
      ];
    }

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
    if(req.query.country) {
      query.country = req.query.country;
    }

    // Handle date filtering
    if(req.query.dateFilter) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      switch(req.query.dateFilter) {
        case 'today':
          query.createdAt = {
            $gte: today,
            $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
          };
          break;
        case 'week':
          const weekStart = new Date(today);
          weekStart.setDate(today.getDate() - today.getDay());
          query.createdAt = {
            $gte: weekStart,
            $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
          };
          break;
        case 'month':
          const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
          query.createdAt = {
            $gte: monthStart,
            $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
          };
          break;
      }
    }

    // Handle country sorting
    if(req.query.countrySort) {
      sort = req.query.countrySort === 'asc' ? 'country' : '-country';
    }

    const sortObj = {};
    const sortField = sort.startsWith('-') ? sort.substring(1) : sort;
    const sortDirection = sort.startsWith('-') ? -1 : 1;
    sortObj[sortField] = sortDirection;

    const inquiries = await Inquiry.find(query)
      .sort(sortObj)
      .skip((page - 1) * limit)
      .limit(limit);

    // Get all unique countries for the filter
    const countries = await Inquiry.distinct('country');

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
      statusCounts: counts,
      countries
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

        // Validate status value
        const validStatuses = ["pending", "in-progress", "follow-up", "closed"];
        if (!validStatuses.includes(status)) {
            return fError(res, "Invalid status value", 400);
        }

        const updatedInquiry = await Inquiry.findByIdAndUpdate(
            id,
            { status, statusResponsedBy: req.user._id },
            { new: true },
            
        );
        if (!updatedInquiry) {
            return fError(res, "Inquiry not found", 404);
        }

        fMsg(res, "Status updated successfully", updatedInquiry, 200);
    } catch (error) {
        console.error('Error updating status:', error);
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

export const exportInquiries = async (req, res) => {
    try {
        const { format } = req.query;
        if (!format) {
            return fError(res, "Format is required", 400);
        }

        // Use the same query builder as getInquiries
        let query = {};
        let sort = '-createdAt';
        
        if(req.query.status && req.query.status !== 'all') {
            query.status = req.query.status;
        }
        if(req.query.country) {
            query.country = req.query.country;
        }

        // Handle date filtering
        if(req.query.dateFilter) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            switch(req.query.dateFilter) {
                case 'today':
                    query.createdAt = {
                        $gte: today,
                        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
                    };
                    break;
                case 'week':
                    const weekStart = new Date(today);
                    weekStart.setDate(today.getDate() - today.getDay());
                    query.createdAt = {
                        $gte: weekStart,
                        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
                    };
                    break;
                case 'month':
                    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
                    query.createdAt = {
                        $gte: monthStart,
                        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
                    };
                    break;
            }
        }

        // Handle country sorting
        if(req.query.countrySort) {
            sort = req.query.countrySort === 'asc' ? 'country' : '-country';
        }

        // Handle regular sorting
        if(req.query.sort) {
            sort = req.query.sort;
        }

        const sortObj = {};
        const sortField = sort.startsWith('-') ? sort.substring(1) : sort;
        const sortDirection = sort.startsWith('-') ? -1 : 1;
        sortObj[sortField] = sortDirection;

        // Get filtered and sorted inquiries (without pagination)
        const inquiries = await Inquiry.find(query).sort(sortObj);
        
        if (!inquiries || inquiries.length === 0) {
            return fError(res, "No data to export", 404);
        }

        const fields = [
            'name',
            'email',
            'phoneNumber',
            'companyName',
            'country',
            'jobTitle',
            'jobDetails',
            'status',
            'createdAt'
        ];

        if (format === 'csv') {
            try {
                const json2csvParser = new Parser({ fields });
                const csv = json2csvParser.parse(inquiries);
                
                res.setHeader('Content-Type', 'text/csv');
                res.setHeader('Content-Disposition', 'attachment; filename=inquiries-export.csv');
                return res.status(200).send(csv);
            } catch (csvError) {
                console.error('CSV generation error:', csvError);
                return fError(res, "Error generating CSV", 500);
            }
        } 
        else if (format === 'excel') {
            try {
                const workbook = new excel.Workbook();
                const worksheet = workbook.addWorksheet('Inquiries');
                
                // Add headers
                worksheet.addRow(fields.map(field => 
                    field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1')
                ));
                
                // Add data
                inquiries.forEach(inquiry => {
                    worksheet.addRow(fields.map(field => {
                        if (field === 'createdAt') {
                            return new Date(inquiry[field]).toLocaleString();
                        }
                        return inquiry[field];
                    }));
                });
                
                // Style the header row
                worksheet.getRow(1).font = { bold: true };
                worksheet.columns.forEach(column => {
                    column.width = 20;
                });
                
                res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
                res.setHeader('Content-Disposition', 'attachment; filename=inquiries-export.xlsx');
                
                return workbook.xlsx.write(res);
            } catch (excelError) {
                console.error('Excel generation error:', excelError);
                return fError(res, "Error generating Excel file", 500);
            }
        }
        
        return fError(res, "Invalid export format", 400);
    } catch (error) {
        console.error('Export error:', error);
        return fError(res, "Error exporting inquiries", 500);
    }
};

export const overviewData = async (req, res) => {
  try {
    const todayInquiries = await Inquiry.find({
      createdAt: {
        $gte: new Date(new Date().setHours(0, 0, 0, 0)),
        $lt: new Date(new Date().setHours(23, 59, 59, 999))
      }
    });
    const countTodayInquiries = todayInquiries.length;
    
    const thisWeekInquiries = await Inquiry.find({
      createdAt: {
        $gte: new Date(new Date().setDate(new Date().getDate() - new Date().getDay())),
        $lt: new Date(new Date().setDate(new Date().getDate() - new Date().getDay() + 7))
      }
    });
    const countThisWeekInquiries = thisWeekInquiries.length;
    const thisMonthInquiries = await Inquiry.find({
      createdAt: {
        $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        $lt: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)
      }
    });
    const countThisMonthInquiries = thisMonthInquiries.length;  
    const pendingInquiries = await Inquiry.find({ status: 'pending' });
    const countPendingInquiries = pendingInquiries.length;
    

    const last10Inquiries = await Inquiry.find().sort({ createdAt: -1 }).limit(10);

    // Add status distribution
    const statusCounts = await Inquiry.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);

    // Add geographical distribution
    const topCountries = await Inquiry.aggregate([
      { $group: { _id: "$country", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    // Add weekly trend
    const weeklyTrend = await getWeeklyTrend();

    const statusDistribution = await Inquiry.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);

    // Add year distribution
    const yearDistribution = await Inquiry.aggregate([
      {
        $group: {
          _id: { $year: "$createdAt" },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: -1 } }, // Sort by year descending
      { $limit: 5 } // Get last 5 years
    ]);

    fMsg(res, "Overview data fetched successfully", {
      countTodayInquiries,
      countThisWeekInquiries,
      countThisMonthInquiries,
      countPendingInquiries,
      last10Inquiries,
      statusCounts,
      topCountries,
      weeklyTrend,
      statusDistribution,
      yearDistribution
    }, 200);


  } catch (error) {
    fError(res, "Error fetching overview data", 500);
  }
};

async function getWeeklyTrend() {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const today = new Date();
  const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

  return await Inquiry.aggregate([
    {
      $match: {
        createdAt: { $gte: lastWeek, $lte: today }
      }
    },
    {
      $group: {
        _id: { $dayOfWeek: "$createdAt" },
        count: { $sum: 1 }
      }
    },
    {
      $project: {
        _id: 0,
        day: "$_id",
        count: 1
      }
    },
    {
      $sort: { day: 1 }
    }
  ]);
}

