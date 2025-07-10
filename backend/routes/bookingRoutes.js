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
  verifyPayment,        // ✅ New
  checkBookingConflict,
  getUserBookingStats, // <-- add this
} = require("../controllers/bookingController");

const auth = require("../middlewares/authMiddleware");
const isAdmin = require("../middlewares/roleMiddleware");

// 🚗 User Routes
router.post("/", auth, createBooking);
router.get("/my", auth, getUserBookings);
router.get("/my/stats", auth, getUserBookingStats); // <-- add this
router.put("/cancel/:id", auth, cancelBooking);

// 🛠️ Admin Routes
router.get("/admin/all", auth, isAdmin, getAllBookings);
router.put("/admin/status/:id", auth, isAdmin, updateBookingStatus);
router.get("/admin/stats", auth, isAdmin, getBookingStats);

// 💳 Payment Routes
router.post("/payment/initiate", auth, initiatePayment);
router.post("/payment/verify", auth, verifyPayment);

// Check booking conflict for a car and date range
router.post("/check-conflict", checkBookingConflict);

module.exports = router;
