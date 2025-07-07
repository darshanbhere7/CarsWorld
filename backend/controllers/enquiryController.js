const Enquiry = require("../models/Enquiry");

// POST /api/enquiry
const submitEnquiry = async (req, res) => {
  try {
    const { name, email, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ error: "All fields are required." });
    }
    const enquiry = new Enquiry({ name, email, message });
    await enquiry.save();
    res.status(201).json({ message: "Enquiry submitted successfully." });
  } catch (err) {
    res.status(500).json({ error: "Failed to submit enquiry." });
  }
};

module.exports = { submitEnquiry }; 