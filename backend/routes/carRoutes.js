// routes/carRoutes.js
const express = require("express");
const router = express.Router();
const {
  addCar,
  getAllCars,
  getCarById,
  updateCar,
  deleteCar,
  adminSetAvailability,
  getAllCarsAdmin,
} = require("../controllers/carController");

const auth = require("../middlewares/authMiddleware");
const isAdmin = require("../middlewares/roleMiddleware");

// Public
router.get("/", getAllCars);
router.get("/:id", getCarById);

// Admin only
router.post("/", auth, isAdmin, addCar);
router.put("/:id", auth, isAdmin, updateCar);
router.delete("/:id", auth, isAdmin, deleteCar);
router.put("/:id/availability", auth, isAdmin, adminSetAvailability);
router.get("/admin/all", auth, isAdmin, getAllCarsAdmin);

module.exports = router;
