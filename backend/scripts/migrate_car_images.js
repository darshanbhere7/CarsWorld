// backend/scripts/migrate_car_images.js
const mongoose = require('mongoose');
const Car = require('../models/Car');
const db = require('../config/db');
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

(async () => {
  try {
    await db();
    const cars = await Car.find({ image: { $exists: true } });
    for (const car of cars) {
      if (car.image && (!car.images || car.images.length === 0)) {
        car.images = [car.image];
        car.image = undefined;
        await car.save();
        console.log(`Migrated car ${car._id}`);
      }
    }
    console.log('Migration complete.');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
})(); 