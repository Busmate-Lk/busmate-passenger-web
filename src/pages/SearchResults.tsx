import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import SearchForm from "@/components/search/SearchForm";
import FilterSidebar from "@/components/search/FilterSidebar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, MapPin, Bus, ArrowRight, Star } from "lucide-react";

// Static bus route data
const busRoutes = [
  {
    id: "1",
    busNumber: "138",
    operator: "SLTB",
    from: "Colombo Fort",
    to: "Kandy",
    departure: "06:30 AM",
    arrival: "09:45 AM",
    duration: "3h 15m",
    fare: "Rs. 280",
    type: "Express",
    rating: 4.2,
    amenities: ["AC", "WiFi", "Comfortable Seats"]
  },
  {
    id: "2",
    busNumber: "1-1",
    operator: "Private",
    from: "Colombo Fort",
    to: "Kandy",
    departure: "07:00 AM",
    arrival: "10:30 AM",
    duration: "3h 30m",
    fare: "Rs. 350",
    type: "Luxury",
    rating: 4.5,
    amenities: ["AC", "WiFi", "Reclining Seats", "Entertainment"]
  },
  {
    id: "3",
    busNumber: "2-1",
    operator: "SLTB",
    from: "Colombo Fort",
    to: "Galle",
    departure: "08:15 AM",
    arrival: "11:00 AM",
    duration: "2h 45m",
    fare: "Rs. 220",
    type: "Semi-Express",
    rating: 4.0,
    amenities: ["Fan", "Comfortable Seats"]
  },
  {
    id: "4",
    busNumber: "240",
    operator: "Private",
    from: "Colombo",
    to: "Negombo",
    departure: "09:00 AM",
    arrival: "10:15 AM",
    duration: "1h 15m",
    fare: "Rs. 120",
    type: "Regular",
    rating: 3.8,
    amenities: ["Fan", "Standard Seats"]
  }
];

interface FilterState {
  routeTypes: string[];
  operators: string[];
  amenities: string[];
  priceRange: [number, number];
  rating: number;
  timeSlots: string[];
  sortBy: string;
}

const SearchResults = () => {
  const location = useLocation();
  const [searchParams, setSearchParams] = useState({ from: "", to: "" });
  const [filteredRoutes, setFilteredRoutes] = useState(busRoutes);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    routeTypes: [],
    operators: [],
    amenities: [],
    priceRange: [0, 500],
    rating: 0,
    timeSlots: [],
    sortBy: "departure"
  });

  // Helper function to get time slot from departure time
  const getTimeSlot = (departure: string) => {
    const hour = parseInt(departure.split(':')[0]);
    const isPM = departure.includes('PM');
    const hour24 = isPM && hour !== 12 ? hour + 12 : hour;
    
    if (hour24 >= 5 && hour24 < 8) return 'early-morning';
    if (hour24 >= 8 && hour24 < 12) return 'morning';
    if (hour24 >= 12 && hour24 < 17) return 'afternoon';
    if (hour24 >= 17 && hour24 < 20) return 'evening';
    if (hour24 >= 20 && hour24 < 23) return 'night';
    return 'early-morning';
  };

  // Helper function to get price as number
  const getPriceAsNumber = (fare: string) => {
    return parseInt(fare.replace('Rs. ', ''));
  };

  // Filter and sort routes
  const applyFilters = () => {
    let filtered = busRoutes.filter(route => {
      // Search filters
      const fromMatch = !searchParams.from || route.from.toLowerCase().includes(searchParams.from.toLowerCase());
      const toMatch = !searchParams.to || route.to.toLowerCase().includes(searchParams.to.toLowerCase());
      
      // Route type filter
      const typeMatch = filters.routeTypes.length === 0 || filters.routeTypes.includes(route.type);
      
      // Operator filter
      const operatorMatch = filters.operators.length === 0 || filters.operators.includes(route.operator);
      
      // Amenities filter
      const amenitiesMatch = filters.amenities.length === 0 || 
        filters.amenities.every(amenity => route.amenities.includes(amenity));
      
      // Price filter
      const price = getPriceAsNumber(route.fare);
      const priceMatch = price >= filters.priceRange[0] && price <= filters.priceRange[1];
      
      // Rating filter
      const ratingMatch = filters.rating === 0 || route.rating >= filters.rating;
      
      // Time slot filter
      const timeSlotMatch = filters.timeSlots.length === 0 || 
        filters.timeSlots.includes(getTimeSlot(route.departure));
      
      return fromMatch && toMatch && typeMatch && operatorMatch && 
             amenitiesMatch && priceMatch && ratingMatch && timeSlotMatch;
    });

    // Sort routes
    switch (filters.sortBy) {
      case 'price-low':
        filtered.sort((a, b) => getPriceAsNumber(a.fare) - getPriceAsNumber(b.fare));
        break;
      case 'price-high':
        filtered.sort((a, b) => getPriceAsNumber(b.fare) - getPriceAsNumber(a.fare));
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'duration':
        filtered.sort((a, b) => {
          const getDurationMinutes = (duration: string) => {
            const parts = duration.split(' ');
            const hours = parseInt(parts[0].replace('h', '')) || 0;
            const minutes = parseInt(parts[1].replace('m', '')) || 0;
            return hours * 60 + minutes;
          };
          return getDurationMinutes(a.duration) - getDurationMinutes(b.duration);
        });
        break;
      case 'departure':
      default:
        filtered.sort((a, b) => {
          const getTime24 = (time: string) => {
            const [timePart, period] = time.split(' ');
            const [hours, minutes] = timePart.split(':').map(Number);
            return period === 'PM' && hours !== 12 ? hours + 12 : hours;
          };
          return getTime24(a.departure) - getTime24(b.departure);
        });
    }

    setFilteredRoutes(filtered);
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const from = urlParams.get("from") || "";
    const to = urlParams.get("to") || "";
    setSearchParams({ from, to });
  }, [location.search]);

  useEffect(() => {
    applyFilters();
  }, [searchParams, filters]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Header Section */}
      <div className="pt-24 pb-12 bg-gradient-hero">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold text-white text-center mb-8">
              Find Your Perfect Route
            </h1>
            <SearchForm variant="page" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Mobile Filter */}
          <div className="lg:hidden mb-6">
            <FilterSidebar
              filters={filters}
              onFiltersChange={setFilters}
              isOpen={isSidebarOpen}
              onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
            />
          </div>

          {/* Desktop Layout */}
          <div className="lg:flex lg:gap-6">
            {/* Desktop Filter Sidebar */}
            <div className="hidden lg:block lg:w-80 lg:flex-shrink-0">
              <div className="sticky top-4">
                <FilterSidebar
                  filters={filters}
                  onFiltersChange={setFilters}
                  isOpen={false}
                  onToggle={() => {}}
                />
              </div>
            </div>

            {/* Results Section */}
            <div className="flex-1 w-full lg:min-w-0">
              {/* Results Header */}
              <div className="mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-foreground">Available Routes</h2>
                    {searchParams.from || searchParams.to ? (
                      <p className="text-sm sm:text-base text-muted-foreground mt-1">
                        Showing routes {searchParams.from && `from ${searchParams.from}`}
                        {searchParams.from && searchParams.to && " "}
                        {searchParams.to && `to ${searchParams.to}`}
                      </p>
                    ) : (
                      <p className="text-sm sm:text-base text-muted-foreground mt-1">
                        Showing all available routes
                      </p>
                    )}
                  </div>
                  <Badge variant="secondary" className="text-sm self-start sm:self-center">
                    {filteredRoutes.length} routes found
                  </Badge>
                </div>
              </div>

              {/* Route Cards */}
              <div className="space-y-4">
                {filteredRoutes.length > 0 ? (
                  filteredRoutes.map((route) => (
                    <Card key={route.id} className="hover:shadow-soft transition-all duration-300 border border-border w-full">
                      <CardContent className="p-4 sm:p-6">
                        <div className="flex flex-col gap-4">
                          {/* Route Info */}
                          <div className="w-full">
                            <div className="flex items-start gap-3 mb-3">
                              <div className="p-2 rounded-lg bg-gradient-primary flex-shrink-0">
                                <Bus className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <h3 className="text-base sm:text-lg font-semibold text-foreground">
                                  Bus {route.busNumber} - {route.operator}
                                </h3>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                  <Badge variant={route.type === "Luxury" ? "default" : "secondary"} className="text-xs">
                                    {route.type}
                                  </Badge>
                                  <div className="flex items-center gap-1">
                                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                    <span>{route.rating}</span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="space-y-2 sm:space-y-0 sm:flex sm:items-center sm:gap-4 text-sm text-muted-foreground mb-3">
                              <div className="flex items-center gap-1">
                                <MapPin className="h-4 w-4 flex-shrink-0" />
                                <span className="truncate">{route.from}</span>
                              </div>
                              <ArrowRight className="h-4 w-4 hidden sm:block flex-shrink-0" />
                              <div className="flex items-center gap-1">
                                <MapPin className="h-4 w-4 flex-shrink-0" />
                                <span className="truncate">{route.to}</span>
                              </div>
                            </div>

                            <div className="flex flex-wrap gap-1 sm:gap-2 mb-3">
                              {route.amenities.map((amenity) => (
                                <Badge key={amenity} variant="outline" className="text-xs">
                                  {amenity}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          {/* Time and Fare Info */}
                          <div className="w-full">
                            <div className="flex flex-col sm:flex-row gap-4">
                              {/* Time Info */}
                              <div className="flex-1">
                                <div className="flex items-center justify-between sm:justify-start sm:gap-4 text-sm">
                                  <div className="text-center">
                                    <div className="text-base sm:text-lg font-semibold text-foreground">{route.departure}</div>
                                    <div className="text-xs text-muted-foreground">Departure</div>
                                  </div>
                                  <div className="flex items-center gap-1 text-muted-foreground">
                                    <Clock className="h-4 w-4" />
                                    <span className="text-xs sm:text-sm">{route.duration}</span>
                                  </div>
                                  <div className="text-center">
                                    <div className="text-base sm:text-lg font-semibold text-foreground">{route.arrival}</div>
                                    <div className="text-xs text-muted-foreground">Arrival</div>
                                  </div>
                                </div>
                              </div>
                              
                              {/* Fare and Buttons */}
                              <div className="flex items-center justify-between sm:justify-end gap-3 sm:flex-shrink-0">
                                <div className="text-left sm:text-right">
                                  <div className="text-lg sm:text-xl font-bold text-primary">{route.fare}</div>
                                  <div className="text-xs sm:text-sm text-muted-foreground">per person</div>
                                </div>
                                <div className="flex gap-2">
                                  <Button 
                                    variant="outline" 
                                    className="px-3 py-2 text-sm"
                                    onClick={() => window.location.href = `/trip/${route.id}`}
                                  >
                                    View Trip
                                  </Button>
                                  <Button 
                                    className="bg-gradient-primary hover:opacity-90 px-4 py-2 text-sm"
                                    onClick={() => window.location.href = `/booking/${route.id}`}
                                  >
                                    Book Now
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Card className="p-6 sm:p-8 text-center w-full">
                    <CardContent>
                      <div className="text-muted-foreground">
                        <Bus className="h-8 sm:h-12 w-8 sm:w-12 mx-auto mb-4 opacity-50" />
                        <h3 className="text-base sm:text-lg font-semibold mb-2">No routes found</h3>
                        <p className="text-sm sm:text-base">Try adjusting your search criteria or search for different locations.</p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchResults;