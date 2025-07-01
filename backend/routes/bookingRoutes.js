// routes/bookingRoutes.js
const express = require("express");
const router = express.Router();
const {
  createBooking,
  getUserBookings,
  cancelBooking,
  getAllBookings,
  updateBookingStatus,
} = require("../controllers/bookingController");

const auth = require("../middlewares/authMiddleware");
const isAdmin = require("../middlewares/roleMiddleware");

// User
router.post("/", auth, createBooking);
router.get("/my", auth, getUserBookings);
router.put("/cancel/:id", auth, cancelBooking);

// Admin
router.get("/admin/all", auth, isAdmin, getAllBookings);
router.put("/admin/status/:id", auth, isAdmin, updateBookingStatus);

module.exports = router;
