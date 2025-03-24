import Inquiry from "../models/inquiries.model.js";
import Blog from "../models/blogs.model.js";
import Gallery from "../models/gallery.model.js";
import User from "../models/users.model.js";

const db = {
    inquiries: Inquiry,
    blogs: Blog,
    gallery: Gallery,
    users: User,
}

export default db;
