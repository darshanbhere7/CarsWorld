import React, { useEffect, useState } from "react";
import api from "../services/api";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { socket } from "../lib/utils";
import { useAuth } from "../context/AuthContext";
import { Search, Filter, RotateCcw, Star, Heart, MapPin, Fuel, Settings, Calendar, TrendingUp, Car } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, EffectFade } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';

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
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-purple-950 to-gray-900 p-2 sm:p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6 md:mb-8">
          <h1 className="text-3xl md:text-4xl font-bold font-playfair tracking-wide text-white mb-2 animate-fade-in drop-shadow-lg antialiased">
            Browse Premium Cars
          </h1>
          <p className="text-blue-200 text-base md:text-lg">
            Discover your perfect ride from our curated collection
          </p>
        </div>
        {/* Filters Section */}
        <Card className="mb-6 md:mb-8 border-0 bg-gradient-to-br from-blue-900/80 via-purple-900/80 to-purple-900/90 backdrop-blur-xl rounded-3xl shadow-2xl ring-2 ring-blue-800/40">
          <CardContent className="py-6 px-4 md:px-10">
            <div className="flex items-center gap-3 mb-6">
              <Filter className="w-8 h-8 text-blue-400 animate-fade-in drop-shadow-lg" />
              <h3 className="text-2xl md:text-3xl font-bold font-playfair tracking-wide text-white antialiased drop-shadow-lg">Filters</h3>
            </div>
            {/* Line 1: All controls in a single row */}
            <div className="flex flex-wrap md:flex-nowrap items-end gap-3 md:gap-4 lg:gap-6 w-full mb-3">
              <div className="flex flex-col flex-1 min-w-[180px] max-w-xs">
                <label className="mb-1 text-blue-300 font-semibold text-xs md:text-sm flex items-center gap-1"><span>🔍</span>Search</label>
                <div className="relative w-full">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-400 w-5 h-5 pointer-events-none" />
                  <Input
                    className="pl-12 pr-4 bg-gradient-to-r from-blue-950/70 via-purple-950/70 to-gray-900/70 text-white placeholder:text-blue-300 border border-blue-800/60 shadow-lg rounded-full focus:ring-2 focus:ring-blue-500/60 focus:border-blue-400 transition-all duration-200 text-base md:text-lg h-12 w-full"
                    placeholder="Search cars..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    aria-label="Search cars"
                  />
                </div>
              </div>
              {/* Brand Filter */}
              <div className="flex flex-col min-w-[120px]">
                <label className="mb-1 text-blue-300 font-semibold text-xs md:text-sm flex items-center gap-1"><span>🚗</span>Brand</label>
                <Select value={brand} onValueChange={setBrand} aria-label="Brand">
                  <SelectTrigger className="bg-gradient-to-r from-blue-950/70 via-purple-950/70 to-gray-900/70 text-white border border-blue-800/60 shadow-lg rounded-full focus:ring-2 focus:ring-blue-500/60 focus:border-blue-400 text-base md:text-lg h-12 px-6">
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent className="bg-blue-950/90 text-white rounded-xl shadow-xl border border-blue-800/60">
                    <SelectItem value="all-brands">All</SelectItem>
                    {uniqueBrands.map((b) => (
                      <SelectItem key={b} value={b}>{b}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {/* Location Filter */}
              <div className="flex flex-col min-w-[120px]">
                <label className="mb-1 text-blue-300 font-semibold text-xs md:text-sm flex items-center gap-1"><span>📍</span>Location</label>
                <Select value={location} onValueChange={setLocation} aria-label="Location">
                  <SelectTrigger className="bg-gradient-to-r from-blue-950/70 via-purple-950/70 to-gray-900/70 text-white border border-blue-800/60 shadow-lg rounded-full focus:ring-2 focus:ring-blue-500/60 focus:border-blue-400 text-base md:text-lg h-12 px-6">
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent className="bg-blue-950/90 text-white rounded-xl shadow-xl border border-blue-800/60">
                    <SelectItem value="all-locations">All</SelectItem>
                    {uniqueLocations.map((l) => (
                      <SelectItem key={l} value={l}>{l}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {/* Fuel Type Filter */}
              <div className="flex flex-col min-w-[120px]">
                <label className="mb-1 text-blue-300 font-semibold text-xs md:text-sm flex items-center gap-1"><span>⛽</span>Fuel</label>
                <Select value={fuelType} onValueChange={setFuelType} aria-label="Fuel type">
                  <SelectTrigger className="bg-gradient-to-r from-blue-950/70 via-purple-950/70 to-gray-900/70 text-white border border-blue-800/60 shadow-lg rounded-full focus:ring-2 focus:ring-blue-500/60 focus:border-blue-400 text-base md:text-lg h-12 px-6">
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent className="bg-blue-950/90 text-white rounded-xl shadow-xl border border-blue-800/60">
                    <SelectItem value="all-fuel-types">All</SelectItem>
                    {uniqueFuelTypes.map((f) => (
                      <SelectItem key={f} value={f}>{f}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {/* Transmission Filter */}
              <div className="flex flex-col min-w-[120px]">
                <label className="mb-1 text-blue-300 font-semibold text-xs md:text-sm flex items-center gap-1"><span>⚙️</span>Transmission</label>
                <Select value={transmission} onValueChange={setTransmission} aria-label="Transmission">
                  <SelectTrigger className="bg-gradient-to-r from-blue-950/70 via-purple-950/70 to-gray-900/70 text-white border border-blue-800/60 shadow-lg rounded-full focus:ring-2 focus:ring-blue-500/60 focus:border-blue-400 text-base md:text-lg h-12 px-6">
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent className="bg-blue-950/90 text-white rounded-xl shadow-xl border border-blue-800/60">
                    <SelectItem value="all-transmissions">All</SelectItem>
                    {uniqueTransmissions.map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {/* Sort By Filter */}
              <div className="flex flex-col min-w-[140px]">
                <label className="mb-1 text-blue-300 font-semibold text-xs md:text-sm flex items-center gap-1"><span>🔽</span>Sort By</label>
                <Select value={sortOption} onValueChange={setSortOption} aria-label="Sort By">
                  <SelectTrigger className="bg-white/10 text-blue-200 border border-blue-700/40 shadow-md rounded-full focus:ring-2 focus:ring-blue-400 text-base md:text-lg h-12 px-6 flex items-center">
                    <SelectValue placeholder="Default" />
                  </SelectTrigger>
                  <SelectContent className="bg-blue-950/90 text-white rounded-xl shadow-xl border border-blue-800/60">
                    <SelectItem value="default">Default</SelectItem>
                    <SelectItem value="priceLow">Price: Low to High</SelectItem>
                    <SelectItem value="priceHigh">Price: High to Low</SelectItem>
                    <SelectItem value="newest">Newest</SelectItem>
                    <SelectItem value="highestRated">Highest Rated</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {/* Reset Button */}
              <div className="flex flex-col min-w-[100px]">
                <label className="mb-1 text-blue-300 font-semibold text-xs md:text-sm flex items-center gap-1 invisible">Reset</label>
                <Button onClick={resetFilters} variant="outline" className="bg-white/10 text-blue-200 border border-blue-700/40 shadow-md hover:bg-blue-900/40 hover:text-white text-base md:text-lg h-12 px-8 rounded-full flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200">
                  <RotateCcw className="w-5 h-5" /> Reset
                </Button>
              </div>
            </div>
            {/* Line 2: Only Available Only checkbox */}
            <div className="flex items-center mt-2">
              <Checkbox id="availability" checked={availabilityOnly} onCheckedChange={setAvailabilityOnly} aria-label="Available only" className="border-blue-500 bg-blue-950/70 rounded-full focus:ring-2 focus:ring-blue-400 w-5 h-5" />
              <label htmlFor="availability" className="text-blue-200 text-base md:text-lg cursor-pointer select-none font-inter ml-2">Available Only</label>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-8">
          {currentCars.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <Car className="w-16 h-16 text-blue-400 mx-auto mb-4" />
              <p className="text-blue-200">No cars found for the selected filters.</p>
            </div>
          ) : (
            currentCars.map((car) => (
              <Card key={car._id} className="group hover:shadow-2xl transition-all duration-500 border-0 shadow-2xl overflow-hidden bg-gradient-to-br from-blue-900/80 via-purple-900/80 to-gray-900/80 backdrop-blur-md rounded-2xl hover:scale-105 hover:bg-gradient-to-tr hover:from-blue-800 hover:to-purple-800">
                <CardContent className="p-0">
                  <div className="relative overflow-hidden">
                    <Link to={`/cars/${car._id}`} tabIndex={0} aria-label={`View details for ${car.name}`}> {/* Make image clickable */}
                      {car.images && car.images.length > 1 ? (
                        <Swiper
                          spaceBetween={0}
                          slidesPerView={1}
                          loop={true}
                          pagination={{ clickable: true, dynamicBullets: true }}
                          navigation={true}
                          effect="fade"
                          modules={[Navigation, Pagination, EffectFade]}
                          className="w-full h-64 rounded-t-2xl" // 4:3 aspect ratio
                        >
                          {car.images.map((img, idx) => (
                            <SwiperSlide key={idx}>
                              <img
                                src={img}
                                alt={`${car.name} image ${idx + 1}`}
                                className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-700 rounded-t-2xl"
                                loading="lazy"
                              />
                            </SwiperSlide>
                          ))}
                        </Swiper>
                      ) : (
                        <img
                          src={car.images && car.images.length > 0 ? car.images[0] : ''}
                          alt={car.name}
                          className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-700 rounded-t-2xl"
                          loading="lazy"
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-t-2xl" />
                    </Link>
                    <div className="absolute top-4 right-4 z-10">
                      <Button
                        size="icon"
                        variant="ghost"
                        aria-label={wishlistIds.includes(car._id) ? 'Remove from wishlist' : 'Add to wishlist'}
                        className={`rounded-full p-2 bg-white/20 hover:bg-pink-500/80 transition-all duration-300 shadow-md focus:outline-none focus:ring-2 focus:ring-pink-400 ${wishlistIds.includes(car._id) ? 'text-pink-500' : 'text-white'}`}
                        onClick={() => handleWishlist(car._id)}
                      >
                        <Heart className={`w-6 h-6 ${wishlistIds.includes(car._id) ? 'fill-pink-500' : ''}`} />
                      </Button>
                    </div>
                    <div className="absolute bottom-4 left-4">
                      <Badge className="bg-green-500 text-white backdrop-blur-sm animate-pulse shadow-md">
                        {car.availability ? 'Available' : 'Unavailable'}
                      </Badge>
                    </div>
                  </div>
                  <div className="p-4 md:p-6">
                    <div className="flex justify-between items-start mb-2 md:mb-4">
                      <div>
                        <h3 className="text-lg md:text-xl font-bold font-playfair tracking-wide text-white group-hover:text-blue-400 transition-colors antialiased">
                          {car.name}
                        </h3>
                        <p className="text-blue-200 font-medium text-sm md:text-base">{car.brand}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                          ₹{car.pricePerDay}
                        </div>
                        <div className="text-xs md:text-sm text-blue-300">per day</div>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs md:text-sm text-blue-300 mb-4 md:mb-6 gap-2 sm:gap-0">
                      <div className="flex items-center">
                        <Fuel className="w-4 h-4 mr-1 text-green-400" />
                        {car.fuelType || 'Petrol'}
                      </div>
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-1 text-blue-400" />
                        {car.location || 'Mumbai'}
                      </div>
                      <div className="flex items-center">
                        <Settings className="w-4 h-4 mr-1 text-purple-400" />
                        {car.transmission || 'Manual'}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <Star className="w-4 h-4 text-yellow-400" />
                      <span className="text-blue-200 font-semibold">
                        {ratingsMap[car._id]?.avg || 'N/A'}
                      </span>
                      <span className="text-blue-300 text-xs">({ratingsMap[car._id]?.count || 0} reviews)</span>
                    </div>
                    <Button asChild className="w-full group/btn bg-gradient-to-r from-blue-700 to-purple-700 hover:from-blue-800 hover:to-purple-800 text-white shadow-lg transition-all duration-300 mt-2">
                      <Link to={`/cars/${car._id}`}>
                        View Details
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-wrap justify-center items-center gap-2 md:gap-4 mb-8">
            {Array.from({ length: totalPages }, (_, i) => (
              <Button
                key={i}
                size="icon"
                variant={currentPage === i + 1 ? "default" : "outline"}
                className={`w-10 h-10 md:w-12 md:h-12 rounded-full text-lg font-bold flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-blue-400 ${currentPage === i + 1 ? 'bg-blue-700 text-white' : 'bg-white/10 text-blue-200 hover:bg-blue-800/40'}`}
                onClick={() => setCurrentPage(i + 1)}
                aria-label={`Go to page ${i + 1}`}
                aria-current={currentPage === i + 1 ? "page" : undefined}
              >
                {i + 1}
              </Button>
            ))}
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