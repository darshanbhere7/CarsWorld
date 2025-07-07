// controllers/reviewController.js
const Review = require("../models/Review");

// 🔘 Create or update review
const addReview = async (req, res) => {
  try {
    const { carId, rating, comment } = req.body;
    const userId = req.user.userId;

    let review = await Review.findOne({ car: carId, user: userId });

    if (review) {
      review.rating = rating;
      review.comment = comment;
      await review.save();
      return res.status(200).json({ message: "Review updated", review });
    }

    review = new Review({ car: carId, user: userId, rating, comment });
    await review.save();

    res.status(201).json({ message: "Review added", review });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🧾 Get all reviews for a specific car
const getCarReviews = async (req, res) => {
  try {
    const carId = req.params.carId;
    const reviews = await Review.find({ car: carId }).populate("user", "name");
    res.status(200).json(reviews);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Get all reviews (full details for admin moderation)
const getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find({})
      .populate("car", "name")
      .populate("user", "name email")
      .select("car user rating comment adminReply");
    res.status(200).json(reviews);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ❌ Delete review (Admin or Owner)
const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: "Review not found" });

    const userId = req.user?.userId;
    const isAdmin = req.user?.role === "admin";

    if (!userId && !isAdmin) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    if (review.user.toString() !== String(userId) && !isAdmin) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await Review.deleteOne({ _id: req.params.id });
    res.status(200).json({ message: "Review deleted" });
  } catch (err) {
    console.error("Error deleting review:", err);
    res.status(500).json({ error: err.message });
  }
};

// Admin reply to review
const adminReplyToReview = async (req, res) => {
  try {
    if (req.user.role !== "admin") return res.status(403).json({ message: "Only admin can reply to reviews" });
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: "Review not found" });
    review.adminReply = req.body.reply;
    await review.save();
    res.status(200).json({ message: "Reply added", review });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  addReview,
  getCarReviews,
  deleteReview,
  getAllReviews,
  adminReplyToReview,
};
