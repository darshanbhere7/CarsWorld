import React, { useEffect, useState } from "react";
import api from "../services/api";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { socket } from "../lib/utils";
import { useAuth } from "../context/AuthContext";
import { Search, Filter, RotateCcw, Star, Heart, MapPin, Fuel, Settings, Calendar, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";

const Cars = () => {
  const [cars, setCars] = useState([]);
  const [filteredCars, setFilteredCars] = useState([]);
  const [ratingsMap, setRatingsMap] = useState({}); // { carId: { avg: "4.5", count: 12 } }

  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("all-locations");
  const [fuelType, setFuelType] = useState("all-fuel-types");
  const [transmission, setTransmission] = useState("all-transmissions");
  const [brand, setBrand] = useState("all-brands");
  const [availabilityOnly, setAvailabilityOnly] = useState(false);
  const [sortOption, setSortOption] = useState("default");

  const [currentPage, setCurrentPage] = useState(1);
  const carsPerPage = 6;

  const { user } = useAuth();
  const [wishlistIds, setWishlistIds] = useState([]);

  useEffect(() => {
    const fetchCars = async () => {
      try {
        const res = await api.get("/cars");
        // Only show available cars
        const availableCars = res.data.filter(car => car.availability !== false);
        setCars(availableCars);
        setFilteredCars(availableCars);
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

    // Listen for real-time car updates
    socket.on("car_updated", fetchCars);
    return () => {
      socket.off("car_updated", fetchCars);
    };
  }, []);

  useEffect(() => {
    let result = [...cars];

    if (search) {
      result = result.filter((car) =>
        car.name.toLowerCase().includes(search.toLowerCase()) ||
        car.brand.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (brand && brand !== "all-brands") result = result.filter((car) => car.brand === brand);
    if (location && location !== "all-locations") result = result.filter((car) =>
      car.location.toLowerCase().includes(location.toLowerCase())
    );
    if (fuelType && fuelType !== "all-fuel-types") result = result.filter((car) => car.fuelType === fuelType);
    if (transmission && transmission !== "all-transmissions") result = result.filter((car) => car.transmission === transmission);
    if (availabilityOnly) result = result.filter((car) => car.availability);

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
    sortOption,
    cars,
    ratingsMap,
  ]);

  useEffect(() => {
    if (user) fetchWishlistIds();
  }, [user]);

  const fetchWishlistIds = async () => {
    try {
      const res = await api.get("/auth/wishlist");
      setWishlistIds(res.data.map(car => car._id));
    } catch {}
  };

  const handleWishlist = async (carId) => {
    if (!user) return toast.info("Login to save cars to wishlist");
    if (wishlistIds.includes(carId)) {
      await api.post("/auth/wishlist/remove", { carId });
      setWishlistIds(wishlistIds.filter(id => id !== carId));
      toast.info("Removed from wishlist");
    } else {
      await api.post("/auth/wishlist/add", { carId });
      setWishlistIds([...wishlistIds, carId]);
      toast.success("Added to wishlist");
    }
  };

  const resetFilters = () => {
    setSearch("");
    setLocation("all-locations");
    setFuelType("all-fuel-types");
    setTransmission("all-transmissions");
    setBrand("all-brands");
    setAvailabilityOnly(false);
    setSortOption("default");
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
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-purple-950 to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold font-playfair tracking-wide text-white mb-2 animate-fade-in drop-shadow-lg antialiased">
            Browse Premium Cars
          </h1>
          <p className="text-blue-200 text-lg">
            Discover your perfect ride from our curated collection
          </p>
        </div>
        {/* Filters Section */}
        <Card className="mb-8 border-0 bg-gradient-to-br from-blue-900/80 via-purple-900/80 to-gray-900/80 backdrop-blur-xl rounded-2xl shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] ring-1 ring-blue-800/40">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="w-6 h-6 text-blue-400 animate-fade-in" />
              <h3 className="text-xl font-bold font-playfair tracking-wide text-white antialiased">Filters</h3>
            </div>
            <div className="flex flex-wrap gap-4 items-center">
              {/* Search Input */}
              <div className="relative flex-1 min-w-[180px]">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400 w-4 h-4 pointer-events-none" />
                <Input
                  className="pl-10 bg-gradient-to-r from-blue-950/60 via-purple-950/60 to-gray-900/60 text-white placeholder:text-blue-300 border border-blue-800/60 shadow-md rounded-lg focus:ring-2 focus:ring-blue-500/60 focus:border-blue-400 transition-all duration-200"
                  placeholder="Search cars..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
              {/* Brand Dropdown */}
              <Select value={brand} onValueChange={setBrand}>
                <SelectTrigger className="min-w-[140px] bg-gradient-to-r from-blue-950/60 via-purple-950/60 to-gray-900/60 text-white border border-blue-800/60 shadow-md rounded-lg focus:ring-2 focus:ring-blue-500/60 focus:border-blue-400 transition-all duration-200 hover:ring-2 hover:ring-blue-400/60 group">
                  <SelectValue placeholder="All Brands" className="text-blue-100 group-hover:text-blue-300" />
                </SelectTrigger>
                <SelectContent className="bg-gradient-to-br from-blue-900/90 via-purple-900/90 to-gray-900/90 text-white border border-blue-800/60 shadow-xl rounded-xl animate-fade-in animate-duration-300">
                  <SelectItem value="all-brands">All Brands</SelectItem>
                  {uniqueBrands.map((b) => (
                    <SelectItem key={b} value={b}>{b}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {/* Location Dropdown */}
              <Select value={location} onValueChange={setLocation}>
                <SelectTrigger className="min-w-[140px] bg-gradient-to-r from-blue-950/60 via-purple-950/60 to-gray-900/60 text-white border border-blue-800/60 shadow-md rounded-lg focus:ring-2 focus:ring-blue-500/60 focus:border-blue-400 transition-all duration-200 hover:ring-2 hover:ring-blue-400/60 group">
                  <SelectValue placeholder="All Locations" className="text-blue-100 group-hover:text-blue-300" />
                </SelectTrigger>
                <SelectContent className="bg-gradient-to-br from-blue-900/90 via-purple-900/90 to-gray-900/90 text-white border border-blue-800/60 shadow-xl rounded-xl animate-fade-in animate-duration-300">
                  <SelectItem value="all-locations">All Locations</SelectItem>
                  {uniqueLocations.map((l) => (
                    <SelectItem key={l} value={l}>{l}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {/* Fuel Type Dropdown */}
              <Select value={fuelType} onValueChange={setFuelType}>
                <SelectTrigger className="min-w-[120px] bg-gradient-to-r from-blue-950/60 via-purple-950/60 to-gray-900/60 text-white border border-blue-800/60 shadow-md rounded-lg focus:ring-2 focus:ring-blue-500/60 focus:border-blue-400 transition-all duration-200 hover:ring-2 hover:ring-blue-400/60 group">
                  <SelectValue placeholder="Fuel Type" className="text-blue-100 group-hover:text-blue-300" />
                </SelectTrigger>
                <SelectContent className="bg-gradient-to-br from-blue-900/90 via-purple-900/90 to-gray-900/90 text-white border border-blue-800/60 shadow-xl rounded-xl animate-fade-in animate-duration-300">
                  <SelectItem value="all-fuel-types">All</SelectItem>
                  {uniqueFuelTypes.map((f) => (
                    <SelectItem key={f} value={f}>{f}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {/* Transmission Dropdown */}
              <Select value={transmission} onValueChange={setTransmission}>
                <SelectTrigger className="min-w-[120px] bg-gradient-to-r from-blue-950/60 via-purple-950/60 to-gray-900/60 text-white border border-blue-800/60 shadow-md rounded-lg focus:ring-2 focus:ring-blue-500/60 focus:border-blue-400 transition-all duration-200 hover:ring-2 hover:ring-blue-400/60 group">
                  <SelectValue placeholder="Transmission" className="text-blue-100 group-hover:text-blue-300" />
                </SelectTrigger>
                <SelectContent className="bg-gradient-to-br from-blue-900/90 via-purple-900/90 to-gray-900/90 text-white border border-blue-800/60 shadow-xl rounded-xl animate-fade-in animate-duration-300">
                  <SelectItem value="all-transmissions">All</SelectItem>
                  {uniqueTransmissions.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {/* Reset Button */}
              <Button onClick={resetFilters} variant="outline" className="bg-white/90 text-blue-900 border border-blue-300 shadow hover:bg-blue-100 hover:text-blue-900 transition-all duration-200 flex items-center gap-2 px-5 py-2 rounded-lg">
                <RotateCcw className="w-4 h-4" /> Reset
              </Button>
              {/* Sort Dropdown */}
              <Select value={sortOption} onValueChange={setSortOption}>
                <SelectTrigger className="min-w-[120px] bg-gradient-to-r from-blue-950/60 via-purple-950/60 to-gray-900/60 text-white border border-blue-800/60 shadow-md rounded-lg focus:ring-2 focus:ring-blue-500/60 focus:border-blue-400 transition-all duration-200 hover:ring-2 hover:ring-blue-400/60 group">
                  <SelectValue placeholder="Sort By" className="text-blue-100 group-hover:text-blue-300" />
                </SelectTrigger>
                <SelectContent className="bg-gradient-to-br from-blue-900/90 via-purple-900/90 to-gray-900/90 text-white border border-blue-800/60 shadow-xl rounded-xl animate-fade-in animate-duration-300">
                  <SelectItem value="default">Default</SelectItem>
                  <SelectItem value="priceLow">Price: Low to High</SelectItem>
                  <SelectItem value="priceHigh">Price: High to Low</SelectItem>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="highestRated">Highest Rated</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {/* Checkboxes */}
            <div className="flex flex-wrap gap-6 mt-4">
              <label className="flex items-center gap-2 cursor-pointer select-none text-white font-inter text-base">
                <Checkbox checked={availabilityOnly} onCheckedChange={setAvailabilityOnly} className="scale-110 focus:ring-2 focus:ring-blue-500/60 border-blue-400 shadow-sm transition-all" />
                Available Only
              </label>
            </div>
          </CardContent>
        </Card>
        {/* Results Info */}
        <div className="mb-6">
          <p className="text-blue-200">
            Showing {currentCars.length} of {filteredCars.length} cars
          </p>
        </div>
        {/* Cars Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {currentCars.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <div className="text-blue-400 text-6xl mb-4">🚗</div>
              <p className="text-blue-200 text-lg">No cars found matching your criteria</p>
            </div>
          ) : (
            currentCars.map((car) => {
              const rating = ratingsMap[car._id];
              return (
                <div key={car._id} className="group relative animate-fade-in">
                  <Card className="overflow-hidden border-0 shadow-2xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 bg-gradient-to-br from-blue-900/80 via-purple-900/80 to-gray-900/80 backdrop-blur-md rounded-2xl">
                    <Link to={`/cars/${car._id}`}> 
                      <div className="relative overflow-hidden">
                        <img 
                          src={car.image} 
                          alt={car.name} 
                          className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300 rounded-t-2xl" 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-t-2xl" />
                        {/* Availability Badge */}
                        {car.availability && (
                          <Badge className="absolute top-3 left-3 bg-green-500 hover:bg-green-600 text-white border-0 shadow-md">
                            Available
                          </Badge>
                        )}
                      </div>
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="font-bold text-xl font-playfair tracking-wide text-white group-hover:text-blue-400 transition-colors antialiased">
                            {car.name}
                          </h3>
                        </div>
                        {/* Rating */}
                        <div className="mb-3">
                          {rating ? (
                            <div className="flex items-center gap-2">
                              <div className="flex items-center">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Star 
                                    key={i} 
                                    className={`w-4 h-4 ${i < Math.floor(rating.avg) ? 'text-yellow-400 fill-current' : 'text-blue-900/40'}`}
                                  />
                                ))}
                              </div>
                              <span className="text-sm text-blue-200">
                                {rating.avg} ({rating.count} reviews)
                              </span>
                            </div>
                          ) : (
                            <p className="text-sm text-blue-400 flex items-center gap-1">
                              <Star className="w-4 h-4" />
                              No reviews yet
                            </p>
                          )}
                        </div>
                        {/* Car Details */}
                        <div className="space-y-2 mb-4">
                          <p className="text-sm text-blue-200 flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-blue-400" />
                            {car.brand} • {car.modelYear}
                          </p>
                          <p className="text-sm text-blue-200 flex items-center gap-2">
                            <Fuel className="w-4 h-4 text-green-400" />
                            {car.fuelType}
                          </p>
                          <p className="text-sm text-blue-200 flex items-center gap-2">
                            <Settings className="w-4 h-4 text-purple-400" />
                            {car.transmission}
                          </p>
                          <p className="text-sm text-blue-200 flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-red-400" />
                            {car.location}
                          </p>
                        </div>
                        {/* Price */}
                        <div className="bg-gradient-to-r from-blue-900/60 to-purple-900/60 rounded-lg p-3">
                          <p className="text-2xl font-bold text-blue-300">
                            ₹{car.pricePerDay}
                            <span className="text-sm text-blue-200 font-normal"> / day</span>
                          </p>
                        </div>
                      </CardContent>
                    </Link>
                    {/* Wishlist Button */}
                    {user && (
                      <Button
                        className="absolute top-3 right-3 p-2 rounded-full bg-blue-950/80 hover:bg-blue-900/90 shadow-md border-0 transition-all duration-200"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleWishlist(car._id);
                        }}
                        variant="ghost"
                      >
                        <Heart 
                          className={`w-5 h-5 transition-colors ${
                            wishlistIds.includes(car._id) 
                              ? 'text-red-500 fill-current' 
                              : 'text-blue-300 hover:text-red-500'
                          }`}
                        />
                      </Button>
                    )}
                  </Card>
                </div>
              );
            })
          )}
        </div>
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-12">
            <div className="flex gap-2">
              {Array.from({ length: totalPages }, (_, i) => (
                <Button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  variant={currentPage === i + 1 ? "default" : "outline"}
                  className={`w-10 h-10 rounded-full transition-all duration-200 ${
                    currentPage === i + 1 
                      ? 'bg-gradient-to-r from-blue-700 to-purple-700 text-white shadow-lg' 
                      : 'bg-blue-950/60 text-blue-200 border-blue-800 hover:bg-blue-900/80'
                  }`}
                >
                  {i + 1}
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>
      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default Cars;