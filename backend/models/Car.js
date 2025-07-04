// models/Car.js
const mongoose = require("mongoose");

const carSchema = new mongoose.Schema({
  name: { type: String, required: true },
  brand: { type: String, required: true },
  modelYear: { type: Number, required: true },
  fuelType: {
    type: String,
    enum: ["Petrol", "Diesel", "Electric", "Hybrid"],
    required: true,
  },
  transmission: {
    type: String,
    enum: ["Automatic", "Manual"],
    required: true,
  },
  engine: { type: String },                  // ✅ New
  seats: { type: Number },                   // ✅ New
  mileage: { type: String },                 // ✅ New
  color: { type: String },                   // ✅ New
  features: [{ type: String }],              // ✅ New
  description: { type: String },             // ✅ New
  pricePerDay: { type: Number, required: true },
  location: { type: String, required: true },
  image: { type: String, required: true },
  availability: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Car", carSchema);
