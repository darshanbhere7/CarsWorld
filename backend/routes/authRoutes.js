// routes/authRoutes.js
const express = require("express");
const router = express.Router();
const { register, login, getProfile, updateProfile, changePassword, getAllUsers, blockUser, unblockUser, promoteUser, demoteUser, getWishlist, addToWishlist, removeFromWishlist } = require("../controllers/authController");
const auth = require("../middlewares/authMiddleware");
const isAdmin = require("../middlewares/roleMiddleware");

router.post("/register", register);
router.post("/login", login);

// Profile management
router.get("/profile", auth, getProfile);
router.put("/profile", auth, updateProfile);
router.put("/change-password", auth, changePassword);

// Admin user management
router.get("/users", auth, isAdmin, getAllUsers);
router.put("/users/:id/block", auth, isAdmin, blockUser);
router.put("/users/:id/unblock", auth, isAdmin, unblockUser);
router.put("/users/:id/promote", auth, isAdmin, promoteUser);
router.put("/users/:id/demote", auth, isAdmin, demoteUser);

// Wishlist routes
router.get("/wishlist", auth, getWishlist);
router.post("/wishlist/add", auth, addToWishlist);
router.post("/wishlist/remove", auth, removeFromWishlist);

module.exports = router;
