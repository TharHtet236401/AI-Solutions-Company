import express from "express";
import {
  getInquiries,
  getInquiry,
  createInquiry,
  deleteInquiry,
  updateInquiryStatus,
  exportInquiries,
  overviewData,
  verifyInquiry,
  replyToInquiry
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
router.post("/verify", verifyInquiry);
router.post("/reply/:id", replyToInquiry);


export default router;
