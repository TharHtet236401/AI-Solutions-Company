import express from "express";
import {
  getInquiries,
  getInquiry,
  createInquiry,
  deleteInquiry,
  updateInquiryStatus,
  exportInquiries,
} from "../controllers/inquiries.controller.js";

const router = express.Router();

router.get("/", getInquiries);
router.get("/export", exportInquiries);
router.get("/:id", getInquiry);
router.post("/", createInquiry);
router.delete("/:id", deleteInquiry);
router.patch("/status/:id", updateInquiryStatus);

export default router;
