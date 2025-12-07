import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Bus, 
  MapPin, 
  ArrowRight, 
  Clock, 
  Star,
  Loader2 
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import SearchForm from "@/components/search/SearchForm";
import FilterSidebar from "@/components/search/FilterSidebar";
import { PassengerApIsService } from "@/generated/api-client/route-management";
import type { 
  PassengerTripResponse, 
  PassengerPaginatedResponsePassengerTripResponse 
} from "@/generated/api-client/route-management";

interface FilterState {
  travelDate: string;
  departureTimeFrom: string;
  departureTimeTo: string;
  operatorType: 'PRIVATE' | 'CTB' | '';
  status: string;
  sortBy: string;
}

interface SearchParams {
  fromStopId?: string;
  toStopId?: string;
  fromName?: string;
  toName?: string;
  fromText?: string;
  toText?: string;
}

const SearchResults = () => {
  const location = useLocation();
  const [searchParams, setSearchParams] = useState<SearchParams>({});
  const [trips, setTrips] = useState<PassengerTripResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [totalTrips, setTotalTrips] = useState(0);
  
  // Initialize filters with today's date
  const today = new Date().toISOString().split('T')[0];
  const [filters, setFilters] = useState<FilterState>({
    travelDate: today,
    departureTimeFrom: '',
    departureTimeTo: '',
    operatorType: '',
    status: '',
    sortBy: 'departure'
  });

  // Parse URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const fromStopId = urlParams.get("fromStopId") || undefined;
    const toStopId = urlParams.get("toStopId") || undefined;
    const fromName = urlParams.get("fromName") || undefined;
    const toName = urlParams.get("toName") || undefined;
    const fromText = urlParams.get("fromText") || undefined;
    const toText = urlParams.get("toText") || undefined;
    
    setSearchParams({ 
      fromStopId, 
      toStopId, 
      fromName, 
      toName, 
      fromText, 
      toText 
    });
  }, [location.search]);

  // Helper function to format time
  const formatTime = (timeString?: string) => {
    if (!timeString) return '';
    
    try {
      // Handle different time formats from API
      const date = new Date(timeString);
      if (isNaN(date.getTime())) {
        // If it's not a valid date, assume it's a LocalTime format like "HH:mm:ss"
        return timeString.substring(0, 5); // Return HH:mm
      }
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return timeString;
    }
  };

  // Helper function to format duration
  const formatDuration = (minutes?: number) => {
    if (!minutes) return '';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  // Helper function to get bus features as amenities
  const getBusAmenities = (trip: PassengerTripResponse) => {
    const amenities: string[] = [];
    if (trip.bus?.features?.hasAirConditioning) amenities.push('AC');
    if (trip.bus?.features?.hasWiFi) amenities.push('WiFi');
    if (trip.bus?.features?.hasToilet) amenities.push('Toilet');
    if (trip.bus?.features?.isAccessible) amenities.push('Accessible');
    return amenities;
  };

  // Search trips function
  const searchTrips = async () => {
    if (!searchParams.fromStopId || !searchParams.toStopId) {
      setError('Please select valid stops for your journey');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await PassengerApIsService.searchTrips(
        searchParams.fromStopId,
        searchParams.toStopId,
        undefined, // routeId
        filters.travelDate,
        filters.departureTimeFrom || undefined,
        filters.departureTimeTo || undefined,
        filters.operatorType || undefined,
        undefined, // operatorId
        filters.status ? filters.status as 'pending' | 'active' | 'in_transit' | 'boarding' | 'departed' | 'completed' | 'cancelled' | 'delayed' : undefined,
        0, // page
        20 // size
      );

      setTrips(response.content || []);
      setTotalTrips(response.totalElements || 0);
    } catch (err) {
      console.error('Error searching trips:', err);
      setError('Failed to search trips. Please try again.');
      setTrips([]);
      setTotalTrips(0);
    } finally {
      setLoading(false);
    }
  };

  // Search when params or filters change
  useEffect(() => {
    if (searchParams.fromStopId && searchParams.toStopId) {
      searchTrips();
    }
  }, [searchParams, filters]);

  // Sort trips based on sortBy filter
  const sortedTrips = [...trips].sort((a, b) => {
    switch (filters.sortBy) {
      case 'duration':
        return (a.duration || 0) - (b.duration || 0);
      case 'fare':
        return (a.fare || 0) - (b.fare || 0);
      case 'departure':
      default:
        // Sort by scheduled departure time
        if (!a.scheduledDeparture || !b.scheduledDeparture) return 0;
        return a.scheduledDeparture.localeCompare(b.scheduledDeparture);
    }
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="pt-32 pb-20 relative">
      {/* Header Section */}
      {/* Background image (low opacity) */}
        <img
          src="/Autobus-de-luxe.jpg"
          alt="Bus background"
          className="absolute inset-0 w-full h-full object-cover opacity-80 pointer-events-none"
        />
        {/* Keep the existing gradient/color effect above the image */}
        <div className="absolute inset-0 bg-gradient-hero opacity-90" />
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold text-white text-center mb-8">
              Find Your Perfect Route
            </h1>
            <SearchForm
              variant="page"
              initialFromText={searchParams.fromText || searchParams.fromName}
              initialToText={searchParams.toText || searchParams.toName}
              initialFromStopId={searchParams.fromStopId}
              initialToStopId={searchParams.toStopId}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto">
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
                    <h2 className="text-xl sm:text-2xl font-bold text-foreground">Available Trips</h2>
                    {searchParams.fromName || searchParams.toName ? (
                      <p className="text-sm sm:text-base text-muted-foreground mt-1">
                        Showing trips {searchParams.fromName && `from ${searchParams.fromName}`}
                        {searchParams.fromName && searchParams.toName && " "}
                        {searchParams.toName && `to ${searchParams.toName}`}
                      </p>
                    ) : (
                      <p className="text-sm sm:text-base text-muted-foreground mt-1">
                        Please search for trips
                      </p>
                    )}
                  </div>
                  {!loading && (
                    <Badge variant="secondary" className="text-sm self-start sm:self-center">
                      {totalTrips} trips found
                    </Badge>
                  )}
                </div>
              </div>

              {/* Loading State */}
              {loading && (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="ml-2 text-muted-foreground">Searching trips...</span>
                </div>
              )}

              {/* Error State */}
              {error && (
                <Card className="p-6 sm:p-8 text-center w-full">
                  <CardContent>
                    <div className="text-red-500">
                      <Bus className="h-8 sm:h-12 w-8 sm:w-12 mx-auto mb-4 opacity-50" />
                      <h3 className="text-base sm:text-lg font-semibold mb-2">Error</h3>
                      <p className="text-sm sm:text-base">{error}</p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Trip Cards */}
              {!loading && !error && (
                <div className="space-y-4">
                  {sortedTrips.length > 0 ? (
                    sortedTrips.map((trip) => (
                      <Card key={trip.tripId} className="hover:shadow-soft transition-all duration-300 border border-border w-full">
                        <CardContent className="p-4 sm:p-6">
                          <div className="flex flex-col gap-4">
                            {/* Trip Info */}
                            <div className="w-full">
                              <div className="flex items-start gap-3 mb-3">
                                <div className="p-2 rounded-lg bg-gradient-primary flex-shrink-0">
                                  <Bus className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <h3 className="text-base sm:text-lg font-semibold text-foreground">
                                    {trip.bus?.plateNumber && `Bus ${trip.bus.plateNumber}`}
                                    {trip.operator?.name && ` - ${trip.operator.name}`}
                                  </h3>
                                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                    <Badge variant={trip.operator?.type === "PRIVATE" ? "default" : "secondary"} className="text-xs">
                                      {trip.operator?.type || 'Unknown'}
                                    </Badge>
                                    {trip.status && (
                                      <Badge variant="outline" className="text-xs">
                                        {trip.status}
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <div className="space-y-2 sm:space-y-0 sm:flex sm:items-center sm:gap-4 text-sm text-muted-foreground mb-3">
                                <div className="flex items-center gap-1">
                                  <MapPin className="h-4 w-4 flex-shrink-0" />
                                  <span className="truncate">{trip.departureStop?.name || searchParams.fromName}</span>
                                </div>
                                <ArrowRight className="h-4 w-4 hidden sm:block flex-shrink-0" />
                                <div className="flex items-center gap-1">
                                  <MapPin className="h-4 w-4 flex-shrink-0" />
                                  <span className="truncate">{trip.arrivalStop?.name || searchParams.toName}</span>
                                </div>
                              </div>

                              {/* Amenities */}
                              {getBusAmenities(trip).length > 0 && (
                                <div className="flex flex-wrap gap-1 sm:gap-2 mb-3">
                                  {getBusAmenities(trip).map((amenity) => (
                                    <Badge key={amenity} variant="outline" className="text-xs">
                                      {amenity}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* Time and Fare Info */}
                            <div className="w-full">
                              <div className="flex flex-col sm:flex-row gap-4">
                                {/* Time Info */}
                                <div className="flex-1">
                                  <div className="flex items-center justify-between sm:justify-start sm:gap-4 text-sm">
                                    <div className="text-center">
                                      <div className="text-base sm:text-lg font-semibold text-foreground">
                                        {formatTime(trip.scheduledDeparture)}
                                      </div>
                                      <div className="text-xs text-muted-foreground">Departure</div>
                                    </div>
                                    <div className="flex items-center gap-1 text-muted-foreground">
                                      <Clock className="h-4 w-4" />
                                      <span className="text-xs sm:text-sm">
                                        {formatDuration(trip.duration)}
                                      </span>
                                    </div>
                                    <div className="text-center">
                                      <div className="text-base sm:text-lg font-semibold text-foreground">
                                        {formatTime(trip.scheduledArrival)}
                                      </div>
                                      <div className="text-xs text-muted-foreground">Arrival</div>
                                    </div>
                                  </div>
                                </div>
                                
                                {/* Fare and Buttons */}
                                <div className="flex items-center justify-between sm:justify-end gap-3 sm:flex-shrink-0">
                                  <div className="text-left sm:text-right">
                                    <div className="text-lg sm:text-xl font-bold text-primary">
                                      {trip.fare ? `Rs. ${trip.fare}` : 'Price TBA'}
                                    </div>
                                    <div className="text-xs sm:text-sm text-muted-foreground">per person</div>
                                    {trip.availableSeats && (
                                      <div className="text-xs text-muted-foreground">
                                        {trip.availableSeats} seats available
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex gap-2">
                                    <Button 
                                      variant="outline" 
                                      className="px-3 py-2 text-sm"
                                      onClick={() => window.location.href = `/trip/${trip.tripId}`}
                                    >
                                      View Trip
                                    </Button>
                                    {trip.bookingAvailable && (
                                      <Button 
                                        className="bg-gradient-primary hover:opacity-90 px-4 py-2 text-sm"
                                        onClick={() => window.location.href = `/booking/${trip.tripId}`}
                                      >
                                        Book Now
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : !loading && (searchParams.fromStopId && searchParams.toStopId) ? (
                    <Card className="p-6 sm:p-8 text-center w-full">
                      <CardContent>
                        <div className="text-muted-foreground">
                          <Bus className="h-8 sm:h-12 w-8 sm:w-12 mx-auto mb-4 opacity-50" />
                          <h3 className="text-base sm:text-lg font-semibold mb-2">No trips found</h3>
                          <p className="text-sm sm:text-base">Try adjusting your search criteria or filters.</p>
                        </div>
                      </CardContent>
                    </Card>
                  ) : !loading && (
                    <Card className="p-6 sm:p-8 text-center w-full">
                      <CardContent>
                        <div className="text-muted-foreground">
                          <Bus className="h-8 sm:h-12 w-8 sm:w-12 mx-auto mb-4 opacity-50" />
                          <h3 className="text-base sm:text-lg font-semibold mb-2">Search for trips</h3>
                          <p className="text-sm sm:text-base">Please use the search form above to find available trips.</p>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchResults;