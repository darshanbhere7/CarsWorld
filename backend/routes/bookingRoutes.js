// routes/bookingRoutes.js
const express = require("express");
const router = express.Router();

const {
  createBooking,
  getUserBookings,
  cancelBooking,
  getAllBookings,
  updateBookingStatus,
  getBookingStats,
  initiatePayment,     // ✅ New
  verifyPayment        // ✅ New
} = require("../controllers/bookingController");

const auth = require("../middlewares/authMiddleware");
const isAdmin = require("../middlewares/roleMiddleware");

// 🚗 User Routes
router.post("/", auth, createBooking);
router.get("/my", auth, getUserBookings);
router.put("/cancel/:id", auth, cancelBooking);

// 🛠️ Admin Routes
router.get("/admin/all", auth, isAdmin, getAllBookings);
router.put("/admin/status/:id", auth, isAdmin, updateBookingStatus);
router.get("/admin/stats", auth, isAdmin, getBookingStats);

// 💳 Payment Routes
router.post("/payment/initiate", auth, initiatePayment);
router.post("/payment/verify", auth, verifyPayment);

module.exports = router;
