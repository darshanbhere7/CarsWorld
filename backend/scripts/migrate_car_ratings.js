// backend/scripts/migrate_car_ratings.js

const mongoose = require("mongoose");
const Car = require("../models/Car");
const Review = require("../models/Review");
const db = require("../config/db");

// Load .env explicitly with path
require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });

(async () => {
  try {
    await db(); // Connect to DB

    const cars = await Car.find();
    for (const car of cars) {
      const reviews = await Review.find({ car: car._id });
      const reviewCount = reviews.length;
      const avgRating = reviewCount
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount
        : 0;

      car.avgRating = avgRating;
      car.reviewCount = reviewCount;
      await car.save();

      console.log(`Updated ${car.name}: avgRating=${avgRating}, reviewCount=${reviewCount}`);
    }

    console.log("✅ Rating migration complete!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Migration failed:", err);
    process.exit(1);
  }
})();
