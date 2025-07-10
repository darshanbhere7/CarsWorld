// routes/reviewRoutes.js
const express = require("express");
const router = express.Router();

const {
  addReview,
  getCarReviews,
  deleteReview,
  getAllReviews, // ✅ added
  adminReplyToReview,
  getUserReviews,
} = require("../controllers/reviewController");

const auth = require("../middlewares/authMiddleware");
const isAdmin = require("../middlewares/roleMiddleware");

// Add or update review
router.post("/", auth, addReview);

// Get all reviews by the logged-in user
router.get("/user", auth, getUserReviews);

// Get reviews for a specific car
router.get("/:carId", getCarReviews);

// ✅ Get all reviews (used in car list for average ratings)
router.get("/", getAllReviews); // keep this **after** `/:carId` to avoid conflict

// Delete a review
router.delete("/:id", auth, deleteReview); // admin or owner only

// Admin reply to review
router.put("/:id/reply", auth, isAdmin, adminReplyToReview);

module.exports = router;
