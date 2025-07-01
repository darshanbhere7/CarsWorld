// models/Car.js
const mongoose = require("mongoose");

const carSchema = new mongoose.Schema({
  name: { type: String, required: true },
  brand: { type: String, required: true },
  modelYear: { type: Number, required: true },
  fuelType: {
    type: String,
    enum: ["Petrol", "Diesel", "Electric", "Hybrid"], // ✅ Note capitalization
    required: true,
  },
  transmission: {
    type: String,
    enum: ["Automatic", "Manual"], // ✅ Note capitalization
    required: true,
  },
  pricePerDay: { type: Number, required: true },
  location: { type: String, required: true },
  image: { type: String, required: true }, // ImageKit URL
  availability: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Car", carSchema);
