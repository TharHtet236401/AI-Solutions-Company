# AI Solutions Company Website

## Project Overview

A modern web application for an AI Solutions company featuring a dynamic admin dashboard, blog management system, and staff management portal. The application includes user authentication, role-based access control, and data visualization capabilities.

## Features

### Public Pages
- Home page with company information and services
- Blog section with featured articles
- Contact form for inquiries
- About page with company details
- Gallery showcase

### Admin Dashboard
- Staff Management System
  - Role-based access control
  - Staff filtering and search
  - Real-time staff count updates
- Blog Management
  - Create, edit, and delete blog posts
  - Category management
  - Featured blog selection
- Data Visualization
  - Staff role distribution charts
  - Inquiry status tracking
  - Geographic distribution analysis
- User Authentication
  - Secure login system
  - Password encryption
  - Session management

## Technologies Used

### Backend
- Node.js
- Express.js
- MongoDB (with Mongoose)
- JWT for authentication

### Frontend
- EJS (Embedded JavaScript templates)
- CSS3 with modern features
- JavaScript (ES6+)
- Chart.js for data visualization
- Font Awesome icons
- Google Fonts

### Tools & Libraries
- Bcrypt for password hashing
- Multer for file uploads
- dotenv for environment variables
- Express-validator for input validation

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm (Node Package Manager)

## Installation & Setup

1. **Clone the Repository**
   ```bash
   git clone https://github.com/yourusername/ai-solutions-company.git
   cd ai-solutions-company
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   - Create a `.env` file in the root directory
   - Add the following configurations:
   ```env
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/ai_solutions
   JWT_SECRET=your_jwt_secret_key
   NODE_ENV=development
   ```

4. **Database Setup**
   - Start MongoDB service
   - The application will automatically create required collections

5. **Start the Application**
   ```bash
   # Development mode
   npm run dev

   # Production mode
   npm start
   ```

6. **Generate Sample Data (Optional)**
   ```bash
   # Generate sample staff data
   node randomStaffGenerator.js

   # Generate sample blog posts
   node randomBlogGenerator.js

   # Generate sample inquiries
   node randomInquiryGenerator.js
   ```


## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact

