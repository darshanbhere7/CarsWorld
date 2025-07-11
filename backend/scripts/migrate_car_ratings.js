const mongoose = require("mongoose");
const Car = require("../models/Car");
const Review = require("../models/Review");
const db = require("../config/db"); // adjust path if needed

async function migrateCarRatings() {
  await db(); // connect to DB

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

  console.log("Migration complete!");
  process.exit();
}

migrateCarRatings(); 