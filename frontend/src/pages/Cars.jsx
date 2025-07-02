import React, { useEffect, useState } from "react";
import api from "../services/api";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

const Cars = () => {
  const [cars, setCars] = useState([]);
  const [filteredCars, setFilteredCars] = useState([]);
  const [ratingsMap, setRatingsMap] = useState({}); // { carId: { avg: "4.5", count: 12 } }

  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");
  const [fuelType, setFuelType] = useState("");
  const [transmission, setTransmission] = useState("");
  const [brand, setBrand] = useState("");
  const [availabilityOnly, setAvailabilityOnly] = useState(false);
  const [showTopRatedOnly, setShowTopRatedOnly] = useState(false); // ✅ NEW
  const [sortOption, setSortOption] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const carsPerPage = 6;

  useEffect(() => {
    const fetchCars = async () => {
      try {
        const res = await api.get("/cars");
        setCars(res.data);
        setFilteredCars(res.data);
      } catch (err) {
        toast.error("Failed to load cars.");
      }
    };

    const fetchRatings = async () => {
      try {
        const res = await api.get("/reviews");
        const tempMap = {};

        res.data.forEach((review) => {
          const carId = review.car.toString();
          if (!tempMap[carId]) tempMap[carId] = { total: 0, count: 0 };
          tempMap[carId].total += review.rating;
          tempMap[carId].count += 1;
        });

        const formattedMap = {};
        for (const id in tempMap) {
          const { total, count } = tempMap[id];
          formattedMap[id] = {
            avg: (total / count).toFixed(1),
            count,
          };
        }

        setRatingsMap(formattedMap);
      } catch (err) {
        console.error("Failed to fetch ratings", err.message);
      }
    };

    fetchCars();
    fetchRatings();
  }, []);

  useEffect(() => {
    let result = [...cars];

    if (search) {
      result = result.filter((car) =>
        car.name.toLowerCase().includes(search.toLowerCase()) ||
        car.brand.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (brand) result = result.filter((car) => car.brand === brand);
    if (location) result = result.filter((car) =>
      car.location.toLowerCase().includes(location.toLowerCase())
    );
    if (fuelType) result = result.filter((car) => car.fuelType === fuelType);
    if (transmission) result = result.filter((car) => car.transmission === transmission);
    if (availabilityOnly) result = result.filter((car) => car.availability);
    if (showTopRatedOnly) {
      result = result.filter(
        (car) => ratingsMap[car._id] && parseFloat(ratingsMap[car._id].avg) >= 4
      );
    }

    if (sortOption === "priceLow") {
      result.sort((a, b) => a.pricePerDay - b.pricePerDay);
    } else if (sortOption === "priceHigh") {
      result.sort((a, b) => b.pricePerDay - a.pricePerDay);
    } else if (sortOption === "newest") {
      result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortOption === "highestRated") {
      result.sort((a, b) => {
        const ratingA = parseFloat(ratingsMap[a._id]?.avg || 0);
        const ratingB = parseFloat(ratingsMap[b._id]?.avg || 0);
        return ratingB - ratingA;
      });
    }

    setFilteredCars(result);
    setCurrentPage(1);
  }, [
    search,
    brand,
    location,
    fuelType,
    transmission,
    availabilityOnly,
    showTopRatedOnly,
    sortOption,
    cars,
    ratingsMap,
  ]);

  const resetFilters = () => {
    setSearch("");
    setLocation("");
    setFuelType("");
    setTransmission("");
    setBrand("");
    setAvailabilityOnly(false);
    setShowTopRatedOnly(false);
    setSortOption("");
    toast.info("Filters reset.");
  };

  const uniqueBrands = [...new Set(cars.map((c) => c.brand))];
  const uniqueLocations = [...new Set(cars.map((c) => c.location))];
  const uniqueFuelTypes = [...new Set(cars.map((c) => c.fuelType))];
  const uniqueTransmissions = [...new Set(cars.map((c) => c.transmission))];

  const indexOfLast = currentPage * carsPerPage;
  const indexOfFirst = indexOfLast - carsPerPage;
  const currentCars = filteredCars.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredCars.length / carsPerPage);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Browse Cars</h2>

      {/* 🔍 Filters */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-4">
        <input
          type="text"
          placeholder="Search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="p-2 border rounded"
        />
        <select value={brand} onChange={(e) => setBrand(e.target.value)} className="p-2 border rounded">
          <option value="">All Brands</option>
          {uniqueBrands.map((b, i) => <option key={i} value={b}>{b}</option>)}
        </select>
        <select value={location} onChange={(e) => setLocation(e.target.value)} className="p-2 border rounded">
          <option value="">All Locations</option>
          {uniqueLocations.map((l, i) => <option key={i} value={l}>{l}</option>)}
        </select>
        <select value={fuelType} onChange={(e) => setFuelType(e.target.value)} className="p-2 border rounded">
          <option value="">All Fuel Types</option>
          {uniqueFuelTypes.map((f, i) => <option key={i} value={f}>{f}</option>)}
        </select>
        <select value={transmission} onChange={(e) => setTransmission(e.target.value)} className="p-2 border rounded">
          <option value="">All Transmissions</option>
          {uniqueTransmissions.map((t, i) => <option key={i} value={t}>{t}</option>)}
        </select>
        <button onClick={resetFilters} className="bg-gray-300 hover:bg-gray-400 text-sm px-3 py-2 rounded">Reset</button>
      </div>

      {/* ✅ Extra Filters */}
      <div className="flex flex-wrap gap-4 items-center justify-between mb-6">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={availabilityOnly} onChange={(e) => setAvailabilityOnly(e.target.checked)} />
          Available Only
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={showTopRatedOnly} onChange={(e) => setShowTopRatedOnly(e.target.checked)} />
          4★ & above
        </label>
        <select value={sortOption} onChange={(e) => setSortOption(e.target.value)} className="p-2 border rounded">
          <option value="">Sort By</option>
          <option value="priceLow">Price: Low to High</option>
          <option value="priceHigh">Price: High to Low</option>
          <option value="newest">Newest</option>
          <option value="highestRated">Highest Rated</option>
        </select>
      </div>

      {/* 🚗 Cars Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentCars.length === 0 ? (
          <p className="col-span-full text-gray-600">No cars found.</p>
        ) : (
          currentCars.map((car) => {
            const rating = ratingsMap[car._id];

            return (
              <Link to={`/cars/${car._id}`} key={car._id}>
                <div className="border rounded-lg overflow-hidden bg-white hover:shadow-lg transition">
                  <img src={car.image} alt={car.name} className="w-full h-48 object-cover" />
                  <div className="p-4">
                    <h3 className="font-bold text-lg">{car.name}</h3>

                    {rating ? (
                      <div className="flex items-center gap-1 text-yellow-500 text-sm mb-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <span key={i}>
                            {i < Math.floor(rating.avg) ? "★" : "☆"}
                          </span>
                        ))}
                        <span className="text-gray-600">({rating.count})</span>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-400">No reviews yet</p>
                    )}

                    <p className="text-sm text-gray-500">{car.brand} • {car.modelYear}</p>
                    <p className="text-sm text-gray-500">{car.fuelType} • {car.transmission}</p>
                    <p className="text-blue-600 font-semibold mt-2">₹{car.pricePerDay} / day</p>
                    <p className="text-xs text-gray-500 mt-1">{car.location}</p>
                  </div>
                </div>
              </Link>
            );
          })
        )}
      </div>

      {/* 📄 Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-4 py-2 rounded border ${currentPage === i + 1 ? "bg-blue-600 text-white" : "bg-white"}`}
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
