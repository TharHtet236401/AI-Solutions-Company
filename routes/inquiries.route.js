import express from "express";
import {
  getInquiries,
  getInquiry,
  createInquiry,
  deleteInquiry,
  updateInquiryStatus,
  exportInquiries,
  overviewData
} from "../controllers/inquiries.controller.js";
import { validateToken } from "../utils/validator.js";




const router = express.Router();

router.get("/", getInquiries);
router.get("/overview", overviewData);
router.get("/export", exportInquiries);
router.get("/:id", getInquiry);
router.post("/", createInquiry);
router.delete("/:id", deleteInquiry);
router.patch("/status/:id", validateToken, updateInquiryStatus);



export default router;
