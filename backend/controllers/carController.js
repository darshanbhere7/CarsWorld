// controllers/carController.js
const Car = require("../models/Car");

// Capitalize helper
function capitalize(str = "") {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

// Add a new car (admin only)
const addCar = async (req, res) => {
  try {
    const {
      name,
      brand,
      modelYear,
      fuelType,
      transmission,
      pricePerDay,
      location,
      image,
      engine,
      seats,
      mileage,
      color,
      features,
      description,
    } = req.body;

    const formattedFuelType = capitalize(fuelType);
    const formattedTransmission = capitalize(transmission);

    const newCar = new Car({
      name,
      brand,
      modelYear: Number(modelYear),
      fuelType: formattedFuelType,
      transmission: formattedTransmission,
      pricePerDay: Number(pricePerDay),
      location,
      image,
      engine,
      seats,
      mileage,
      color,
      features,
      description,
    });

    await newCar.save();
    res.status(201).json({ message: "Car added successfully", car: newCar });
  } catch (err) {
    console.error("Car creation failed:", err);
    res.status(500).json({ error: err.message });
  }
};

// Get all cars
const getAllCars = async (req, res) => {
  try {
    let cars;
    if (req.user && req.user.role === "admin") {
      cars = await Car.find();
    } else {
      cars = await Car.find({ availability: true });
    }
    res.status(200).json(cars);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get single car by ID
const getCarById = async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);
    if (!car) return res.status(404).json({ message: "Car not found" });
    res.status(200).json(car);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update car
const updateCar = async (req, res) => {
  try {
    const updatedCar = await Car.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.status(200).json({ message: "Car updated", car: updatedCar });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete car
const deleteCar = async (req, res) => {
  try {
    await Car.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Car deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Admin: Set car availability
const adminSetAvailability = async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);
    if (!car) return res.status(404).json({ message: "Car not found" });
    car.availability = req.body.availability;
    await car.save();
    res.status(200).json({ message: `Car marked as ${car.availability ? "available" : "unavailable"}`, car });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Admin: Get all cars (no filter)
const getAllCarsAdmin = async (req, res) => {
  try {
    const cars = await Car.find();
    res.status(200).json(cars);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  addCar,
  getAllCars,
  getCarById,
  updateCar,
  deleteCar,
  adminSetAvailability,
  getAllCarsAdmin,
};
