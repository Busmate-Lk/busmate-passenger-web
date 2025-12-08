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
import { PassengerQueryService } from "@/generated/api-client/route-management";
import type { 
  BusResult,
  FindMyBusResponse
} from "@/generated/api-client/route-management";

interface FilterState {
  departureTimeFrom: string;
  routeNumber: string;
  roadType: 'NORMALWAY' | 'EXPRESSWAY' | '';
  sortBy: string;
}

interface SearchParams {
  fromStopId?: string;
  toStopId?: string;
  fromName?: string;
  toName?: string;
  fromText?: string;
  toText?: string;
  date?: string;
}

const FindMyBusPage = () => {
  const location = useLocation();
  const [searchParams, setSearchParams] = useState<SearchParams>({});
  const [busResults, setBusResults] = useState<BusResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [totalResults, setTotalResults] = useState(0);
  const [fromStopName, setFromStopName] = useState<string>('');
  const [toStopName, setToStopName] = useState<string>('');
  
  // Initialize filters
  const [filters, setFilters] = useState<FilterState>({
    departureTimeFrom: '',
    routeNumber: '',
    roadType: '',
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
    const date = urlParams.get("date") || undefined;
    
    setSearchParams({ 
      fromStopId, 
      toStopId, 
      fromName, 
      toName, 
      fromText, 
      toText,
      date
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
    if (!minutes) return 'N/A';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  // Helper function to get data mode badge color
  const getDataModeBadgeVariant = (dataMode?: string) => {
    switch (dataMode) {
      case 'REALTIME':
        return 'default'; // Primary color
      case 'SCHEDULE':
        return 'secondary';
      case 'STATIC':
        return 'outline';
      default:
        return 'outline';
    }
  };

  // Helper function to get departure time based on data mode
  const getDepartureTime = (bus: BusResult) => {
    if (bus.dataMode === 'REALTIME' && bus.actualDepartureTime) {
      return bus.actualDepartureTime;
    }
    if (bus.dataMode === 'SCHEDULE' && bus.scheduledDepartureAtOrigin) {
      return bus.scheduledDepartureAtOrigin;
    }
    return null;
  };

  // Helper function to get arrival time based on data mode
  const getArrivalTime = (bus: BusResult) => {
    if (bus.dataMode === 'REALTIME' && bus.actualArrivalTime) {
      return bus.actualArrivalTime;
    }
    if (bus.dataMode === 'SCHEDULE' && bus.scheduledArrivalAtDestination) {
      return bus.scheduledArrivalAtDestination;
    }
    return null;
  };

  // Search buses function
  const searchBuses = async () => {
    if (!searchParams.fromStopId || !searchParams.toStopId) {
      setError('Please select valid stops for your journey');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response: FindMyBusResponse = await PassengerQueryService.findMyBus(
        searchParams.fromStopId,
        searchParams.toStopId,
        searchParams.date || undefined,
        filters.departureTimeFrom || undefined,
        filters.routeNumber || undefined,
        filters.roadType || undefined,
        true, // includeScheduledData
        true  // includeRouteData
      );

      setBusResults(response.results || []);
      setTotalResults(response.results?.length || 0);
      
      // Store stop names from response
      if (response.fromStop?.name) setFromStopName(response.fromStop.name);
      if (response.toStop?.name) setToStopName(response.toStop.name);
    } catch (err) {
      console.error('Error searching buses:', err);
      setError('Failed to search buses. Please try again.');
      setBusResults([]);
      setTotalResults(0);
    } finally {
      setLoading(false);
    }
  };

  // Search when params or filters change
  useEffect(() => {
    if (searchParams.fromStopId && searchParams.toStopId) {
      searchBuses();
    }
  }, [searchParams, filters]);

  // Sort buses based on sortBy filter
  const sortedBuses = [...busResults].sort((a, b) => {
    switch (filters.sortBy) {
      case 'duration':
        return (a.estimatedDurationMinutes || 0) - (b.estimatedDurationMinutes || 0);
      case 'distance':
        return (a.distanceKm || 0) - (b.distanceKm || 0);
      case 'dataMode':
        // Sort by data mode priority: REALTIME > SCHEDULE > STATIC
        const modeOrder = { REALTIME: 0, SCHEDULE: 1, STATIC: 2 };
        const modeA = modeOrder[a.dataMode as keyof typeof modeOrder] ?? 3;
        const modeB = modeOrder[b.dataMode as keyof typeof modeOrder] ?? 3;
        return modeA - modeB;
      case 'departure':
      default:
        // Sort by departure time
        const depA = getDepartureTime(a);
        const depB = getDepartureTime(b);
        if (!depA || !depB) return 0;
        return depA.localeCompare(depB);
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
              initialDate={searchParams.date}
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
                    <h2 className="text-xl sm:text-2xl font-bold text-foreground">Available Buses</h2>
                    {fromStopName || toStopName ? (
                      <p className="text-sm sm:text-base text-muted-foreground mt-1">
                        Showing buses {fromStopName && `from ${fromStopName}`}
                        {fromStopName && toStopName && " "}
                        {toStopName && `to ${toStopName}`}
                      </p>
                    ) : (
                      <p className="text-sm sm:text-base text-muted-foreground mt-1">
                        Please search for buses
                      </p>
                    )}
                  </div>
                  {!loading && (
                    <Badge variant="secondary" className="text-sm self-start sm:self-center">
                      {totalResults} {totalResults === 1 ? 'bus' : 'buses'} found
                    </Badge>
                  )}
                </div>
              </div>

              {/* Loading State */}
              {loading && (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="ml-2 text-muted-foreground">Searching buses...</span>
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

              {/* Bus Cards */}
              {!loading && !error && (
                <div className="space-y-4">
                  {sortedBuses.length > 0 ? (
                    sortedBuses.map((bus, index) => (
                      <Card key={bus.tripId || bus.scheduleId || `${bus.routeId}-${index}`} className="hover:shadow-soft transition-all duration-300 border border-border w-full">
                        <CardContent className="p-4 sm:p-6">
                          <div className="flex flex-col gap-4">
                            {/* Bus Info */}
                            <div className="w-full">
                              <div className="flex items-start gap-3 mb-3">
                                <div className="p-2 rounded-lg bg-gradient-primary flex-shrink-0">
                                  <Bus className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <h3 className="text-base sm:text-lg font-semibold text-foreground">
                                    {bus.routeNumber && `Route ${bus.routeNumber}`}
                                    {bus.routeName && ` - ${bus.routeName}`}
                                  </h3>
                                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1 flex-wrap">
                                    <Badge variant={getDataModeBadgeVariant(bus.dataMode)} className="text-xs">
                                      {bus.dataMode || 'STATIC'}
                                    </Badge>
                                    {bus.operatorName && (
                                      <Badge variant="secondary" className="text-xs">
                                        {bus.operatorName}
                                      </Badge>
                                    )}
                                    {bus.roadType && (
                                      <Badge variant="outline" className="text-xs">
                                        {bus.roadType}
                                      </Badge>
                                    )}
                                    {bus.tripStatus && (
                                      <Badge variant="outline" className="text-xs">
                                        {bus.tripStatus}
                                      </Badge>
                                    )}
                                  </div>
                                  {bus.routeThrough && (
                                    <p className="text-xs text-muted-foreground mt-1">
                                      Via: {bus.routeThrough}
                                    </p>
                                  )}
                                </div>
                              </div>

                              <div className="space-y-2 sm:space-y-0 sm:flex sm:items-center sm:gap-4 text-sm text-muted-foreground mb-3">
                                <div className="flex items-center gap-1">
                                  <MapPin className="h-4 w-4 flex-shrink-0" />
                                  <span className="truncate">{fromStopName || 'Origin'}</span>
                                </div>
                                <ArrowRight className="h-4 w-4 hidden sm:block flex-shrink-0" />
                                <div className="flex items-center gap-1">
                                  <MapPin className="h-4 w-4 flex-shrink-0" />
                                  <span className="truncate">{toStopName || 'Destination'}</span>
                                </div>
                                {bus.distanceKm && (
                                  <Badge variant="outline" className="text-xs">
                                    {bus.distanceKm.toFixed(1)} km
                                  </Badge>
                                )}
                              </div>

                              {/* Bus Details */}
                              {(bus.busPlateNumber || bus.busModel || bus.busCapacity) && (
                                <div className="flex flex-wrap gap-1 sm:gap-2 mb-3">
                                  {bus.busPlateNumber && (
                                    <Badge variant="outline" className="text-xs">
                                      {bus.busPlateNumber}
                                    </Badge>
                                  )}
                                  {bus.busModel && (
                                    <Badge variant="outline" className="text-xs">
                                      {bus.busModel}
                                    </Badge>
                                  )}
                                  {bus.busCapacity && (
                                    <Badge variant="outline" className="text-xs">
                                      Capacity: {bus.busCapacity}
                                    </Badge>
                                  )}
                                </div>
                              )}

                              {/* Status Message */}
                              {bus.statusMessage && (
                                <p className="text-sm text-muted-foreground italic">
                                  {bus.statusMessage}
                                </p>
                              )}
                            </div>

                            {/* Time Info */}
                            <div className="w-full">
                              <div className="flex flex-col sm:flex-row gap-4">
                                {/* Time Details */}
                                <div className="flex-1">
                                  <div className="flex items-center justify-between sm:justify-start sm:gap-4 text-sm">
                                    {getDepartureTime(bus) ? (
                                      <>
                                        <div className="text-center">
                                          <div className="text-base sm:text-lg font-semibold text-foreground">
                                            {formatTime(getDepartureTime(bus)!)}
                                          </div>
                                          <div className="text-xs text-muted-foreground">
                                            {bus.dataMode === 'REALTIME' ? 'Actual' : 'Scheduled'} Departure
                                          </div>
                                        </div>
                                        {bus.estimatedDurationMinutes && (
                                          <div className="flex items-center gap-1 text-muted-foreground">
                                            <Clock className="h-4 w-4" />
                                            <span className="text-xs sm:text-sm">
                                              {formatDuration(bus.estimatedDurationMinutes)}
                                            </span>
                                          </div>
                                        )}
                                        {getArrivalTime(bus) && (
                                          <div className="text-center">
                                            <div className="text-base sm:text-lg font-semibold text-foreground">
                                              {formatTime(getArrivalTime(bus)!)}
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                              {bus.dataMode === 'REALTIME' ? 'Actual' : 'Scheduled'} Arrival
                                            </div>
                                          </div>
                                        )}
                                      </>
                                    ) : (
                                      <div className="text-sm text-muted-foreground">
                                        <p>Time information not available</p>
                                        {bus.estimatedDurationMinutes && (
                                          <div className="flex items-center gap-1 mt-1">
                                            <Clock className="h-4 w-4" />
                                            <span>Estimated duration: {formatDuration(bus.estimatedDurationMinutes)}</span>
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </div>
                                
                                {/* Action Buttons */}
                                <div className="flex items-center justify-end gap-3 sm:flex-shrink-0">
                                  {bus.dataMode === 'REALTIME' || bus.dataMode === 'SCHEDULE' ? (
                                    <Button 
                                      className="bg-gradient-primary hover:opacity-90 px-4 py-2 text-sm"
                                      onClick={() => window.location.href = `/trip/${bus.tripId || bus.scheduleId}`}
                                    >
                                      View Info
                                    </Button>
                                  ) : (
                                    <Button 
                                      variant="outline" 
                                      className="px-3 py-2 text-sm"
                                      onClick={() => window.location.href = `/route/${bus.routeId}`}
                                    >
                                      View Route
                                    </Button>
                                  )}
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
                          <h3 className="text-base sm:text-lg font-semibold mb-2">No buses found</h3>
                          <p className="text-sm sm:text-base">Try adjusting your search criteria or filters.</p>
                        </div>
                      </CardContent>
                    </Card>
                  ) : !loading && (
                    <Card className="p-6 sm:p-8 text-center w-full">
                      <CardContent>
                        <div className="text-muted-foreground">
                          <Bus className="h-8 sm:h-12 w-8 sm:w-12 mx-auto mb-4 opacity-50" />
                          <h3 className="text-base sm:text-lg font-semibold mb-2">Search for buses</h3>
                          <p className="text-sm sm:text-base">Please use the search form above to find available buses.</p>
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

export default FindMyBusPage;