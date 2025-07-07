const express = require("express");
const router = express.Router();
const { submitEnquiry } = require("../controllers/enquiryController");

// POST /api/enquiry
router.post("/", submitEnquiry);

module.exports = router; 