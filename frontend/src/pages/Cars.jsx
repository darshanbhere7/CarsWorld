import React, { useEffect, useState } from "react";
import api from "../services/api";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

const Cars = () => {
  const [cars, setCars] = useState([]);
  const [filteredCars, setFilteredCars] = useState([]);

  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");
  const [fuelType, setFuelType] = useState("");
  const [transmission, setTransmission] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const carsPerPage = 6;

  useEffect(() => {
    const fetchCars = async () => {
      try {
        const res = await api.get("/cars");
        setCars(res.data);
        setFilteredCars(res.data);
        toast.success("Cars loaded successfully!");
      } catch (err) {
        console.error("Failed to fetch cars", err.message);
        toast.error("Failed to load cars.");
      }
    };

    fetchCars();
  }, []);

  useEffect(() => {
    let result = cars;

    if (search) {
      result = result.filter((car) =>
        car.name.toLowerCase().includes(search.toLowerCase()) ||
        car.brand.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (location) {
      result = result.filter((car) => car.location === location);
    }

    if (fuelType) {
      result = result.filter((car) => car.fuelType === fuelType);
    }

    if (transmission) {
      result = result.filter((car) => car.transmission === transmission);
    }

    setFilteredCars(result);
    setCurrentPage(1); // Reset page when filter/search changes
  }, [search, location, fuelType, transmission, cars]);

  const uniqueLocations = [...new Set(cars.map((c) => c.location))];
  const uniqueFuelTypes = [...new Set(cars.map((c) => c.fuelType))];
  const uniqueTransmissions = [...new Set(cars.map((c) => c.transmission))];

  const resetFilters = () => {
    setSearch("");
    setLocation("");
    setFuelType("");
    setTransmission("");
    toast.info("Filters reset.");
  };

  // Pagination logic
  const indexOfLast = currentPage * carsPerPage;
  const indexOfFirst = indexOfLast - carsPerPage;
  const currentCars = filteredCars.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredCars.length / carsPerPage);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Browse Cars</h2>

      {/* 🔍 Search and Filter UI */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <input
          type="text"
          placeholder="Search by name or brand"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="p-2 border rounded"
        />

        <select
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="p-2 border rounded"
        >
          <option value="">All Locations</option>
          {uniqueLocations.map((loc, i) => (
            <option key={i} value={loc}>
              {loc}
            </option>
          ))}
        </select>

        <select
          value={fuelType}
          onChange={(e) => setFuelType(e.target.value)}
          className="p-2 border rounded"
        >
          <option value="">All Fuel Types</option>
          {uniqueFuelTypes.map((fuel, i) => (
            <option key={i} value={fuel}>
              {fuel}
            </option>
          ))}
        </select>

        <select
          value={transmission}
          onChange={(e) => setTransmission(e.target.value)}
          className="p-2 border rounded"
        >
          <option value="">All Transmissions</option>
          {uniqueTransmissions.map((trans, i) => (
            <option key={i} value={trans}>
              {trans}
            </option>
          ))}
        </select>

        <button
          onClick={resetFilters}
          className="bg-gray-300 hover:bg-gray-400 text-sm px-3 py-2 rounded"
        >
          Reset Filters
        </button>
      </div>

      {/* 🧮 Result Count */}
      <p className="mb-3 text-gray-600">
        Showing {filteredCars.length} {filteredCars.length === 1 ? "car" : "cars"}
      </p>

      {/* 🚗 Cars List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentCars.length === 0 ? (
          <p className="text-gray-600 col-span-full">No cars found.</p>
        ) : (
          currentCars.map((car) => (
            <Link to={`/cars/${car._id}`} key={car._id}>
              <div className="border rounded-lg overflow-hidden bg-white hover:shadow-lg transition">
                <img
                  src={car.image}
                  alt={car.name}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <h3 className="font-bold text-lg">{car.name}</h3>
                  <p className="text-sm text-gray-500">
                    {car.brand} • {car.modelYear}
                  </p>
                  <p className="text-blue-600 font-semibold mt-2">
                    ₹{car.pricePerDay} / day
                  </p>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>

      {/* 📄 Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-4 py-2 rounded border ${
                currentPage === i + 1 ? "bg-blue-600 text-white" : "bg-white"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default Cars;
