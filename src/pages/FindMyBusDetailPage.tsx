import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, 
  Bus, 
  Clock, 
  MapPin, 
  Navigation,
  Phone,
  User,
  Loader2,
  AlertCircle,
  Wifi,
  Wind,
  Battery,
  Users,
  ChevronDown
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import RouteMap from "@/components/RouteMap";
import { TripManagementService, ScheduleManagementService } from "@/generated/api-client/route-management";
import type { TripResponse, ScheduleResponse, ScheduleStopResponse, ScheduleCalendarResponse } from "@/generated/api-client/route-management";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type StopViewMode = 'timings' | 'arrival-departure' | 'all';

interface DetailData {
  // Common fields
  routeName?: string;
  routeNumber?: string;
  roadType?: string;
  origin?: string;
  destination?: string;
  departureTime?: string;
  arrivalTime?: string;
  duration?: number;
  // Schedule data
  operatingDays?: string[];
  // Bus data
  busPlateNumber?: string;
  busModel?: string;
  busCapacity?: number;
  operatorName?: string;
  driverName?: string;
  conductorName?: string;
  contactNumber?: string;
  // Stops
  stops: ScheduleStopResponse[];
}

/**
 * FindMyBusDetailPage - Unified detail page showing bus result details
 * 
 * URL Pattern:
 * - /findmybus/detail?type=trip&id=X
 * - /findmybus/detail?type=schedule&id=X&date=YYYY-MM-DD
 */
const FindMyBusDetailPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const type = searchParams.get('type') as 'trip' | 'schedule' | null;
  const id = searchParams.get('id');
  const dateParam = searchParams.get('date') || new Date().toISOString().split('T')[0];
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<DetailData | null>(null);
  const [stopViewMode, setStopViewMode] = useState<StopViewMode>('timings');

  // Fetch data based on type
  useEffect(() => {
    const fetchData = async () => {
      if (!id || !type) {
        setError("Invalid URL parameters");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        let detailData: DetailData;

        if (type === 'trip') {
          const tripResponse = await TripManagementService.getTripById(id);
          let scheduleData: ScheduleResponse | undefined;
          
          if (tripResponse.scheduleId) {
            try {
              scheduleData = await ScheduleManagementService.getScheduleById(tripResponse.scheduleId);
            } catch (err) {
              console.error("Failed to fetch schedule data:", err);
            }
          }

          const stops = scheduleData?.scheduleStops?.sort((a, b) => (a.stopOrder || 0) - (b.stopOrder || 0)) || [];
          const firstStop = stops[0];
          const lastStop = stops[stops.length - 1];

          detailData = {
            routeName: tripResponse.routeName,
            routeNumber: scheduleData?.routeName?.match(/\d+-\d+/)?.[0],
            origin: firstStop?.stopName,
            destination: lastStop?.stopName,
            departureTime: tripResponse.scheduledDepartureTime || tripResponse.actualDepartureTime,
            arrivalTime: tripResponse.scheduledArrivalTime || tripResponse.actualArrivalTime,
            operatingDays: scheduleData?.scheduleCalendars ? getOperatingDays(scheduleData.scheduleCalendars) : [],
            busPlateNumber: tripResponse.busPlateNumber,
            busModel: tripResponse.busModel,
            operatorName: tripResponse.operatorName,
            stops,
          };
        } else {
          const scheduleResponse = await ScheduleManagementService.getScheduleById(id);
          const stops = scheduleResponse.scheduleStops?.sort((a, b) => (a.stopOrder || 0) - (b.stopOrder || 0)) || [];
          const firstStop = stops[0];
          const lastStop = stops[stops.length - 1];
          

          detailData = {
            routeName: scheduleResponse.routeName,
            routeNumber: scheduleResponse.routeName?.match(/\d+-\d+/)?.[0],
            origin: firstStop?.stopName,
            destination: lastStop?.stopName,
            departureTime: firstStop?.departureTime,
            arrivalTime: lastStop?.arrivalTime,
            operatingDays: scheduleResponse.scheduleCalendars ? getOperatingDays(scheduleResponse.scheduleCalendars) : [],
            stops,
          };
        }

        setData(detailData);
      } catch (err: any) {
        console.error(`Failed to fetch ${type} details:`, err);
        setError(err.message || `Failed to load details. Please try again.`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, type, dateParam]);

  // Helper functions
  const formatTime = (timeString?: string | null) => {
    if (!timeString) return null;
    try {
      // If it's just time (HH:MM:SS), prepend a dummy date to create a valid Date object
      const fullDateString = timeString.includes('T') ? timeString : `2000-01-01T${timeString}`;
      const date = new Date(fullDateString);
      if (isNaN(date.getTime())) throw new Error('Invalid date');
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
    } catch {
      return timeString;
    }
  };

  const formatDuration = (minutes?: number) => {
    if (!minutes) return null;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  };

  const getOperatingDays = (calendar: ScheduleCalendarResponse[]): string[] => {
    if (!calendar || calendar.length === 0) return [];
    const cal = calendar[0];
    const days: string[] = [];
    if (cal.monday) days.push('Mon');
    if (cal.tuesday) days.push('Tue');
    if (cal.wednesday) days.push('Wed');
    if (cal.thursday) days.push('Thu');
    if (cal.friday) days.push('Fri');
    if (cal.saturday) days.push('Sat');
    if (cal.sunday) days.push('Sun');
    return days;
  };

  const calculateDuration = () => {
    if (!data?.departureTime || !data?.arrivalTime) return null;
    try {
      // Convert time strings to Date objects, handling HH:MM:SS format
      const departureStr = data.departureTime.includes('T') ? data.departureTime : `2000-01-01T${data.departureTime}`;
      const arrivalStr = data.arrivalTime.includes('T') ? data.arrivalTime : `2000-01-01T${data.arrivalTime}`;
      const departure = new Date(departureStr);
      const arrival = new Date(arrivalStr);
      if (isNaN(departure.getTime()) || isNaN(arrival.getTime())) return null;
      const diffMs = arrival.getTime() - departure.getTime();
      return Math.floor(diffMs / 60000); // Convert to minutes
    } catch {
      return null;
    }
  };

  // Filter stops based on view mode
  const getFilteredStops = () => {
    if (!data?.stops) return [];
    
    switch (stopViewMode) {
      case 'timings':
        return data.stops.filter(s => s.arrivalTime || s.departureTime);
      case 'arrival-departure':
        return data.stops.filter(s => s.arrivalTime && s.departureTime);
      case 'all':
        return data.stops;
      default:
        return data.stops;
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">Loading details...</span>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <Card className="p-8 text-center max-w-2xl mx-auto">
            <CardContent>
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Error Loading Details</h3>
              <p className="text-muted-foreground mb-6">{error}</p>
              <Button onClick={() => navigate(-1)}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go Back
              </Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  // Not found state
  if (!data) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <Card className="p-8 text-center max-w-2xl mx-auto">
            <CardContent>
              <Bus className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">Not Found</h3>
              <p className="text-muted-foreground mb-6">The requested details could not be found.</p>
              <Button onClick={() => navigate('/findmybus')}>
                Go to Search
              </Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  const duration = calculateDuration();
  const filteredStops = getFilteredStops();
  const stopsForMap = data.stops.map((stop, index) => ({
    name: stop.stopName || '',
    km: index * 10, // Approximate distance based on order
    location: stop.location ? {
      latitude: stop.location.latitude || 0,
      longitude: stop.location.longitude || 0,
    } : undefined
  }));

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="py-8 relative">
      {/* Header Section */}
      {/* Background image (low opacity) */}
        <img
          src="/Autobus-de-luxe.jpg"
          alt="Bus background"
          className="absolute inset-0 w-full h-full object-cover opacity-80 pointer-events-none"
        />
        {/* Keep the existing gradient/color effect above the image */}
        <div className="absolute inset-0 bg-gradient-hero opacity-90" />
      </div>
      
      <div className="container mx-auto px-4 py-8 max-w-[1200px]">
        {/* Page Header */}
        <div className="mb-8 flex gap-4">
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)}
            className="-ml-2"
          >
            <ArrowLeft className="h-8 w-8" />
          </Button>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            {data.origin || 'Origin'} to {data.destination || 'Destination'}
          </h1>
        </div>

        {/* Bus Summary Card */}
        <Card className="mb-6 bg-muted/30">
          <CardContent className="p-4 md:p-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {data.routeNumber && (
              <div>
                <p className="text-md text-muted-foreground mb-1">Route No</p>
                <p className="text-2xl font-semibold">{data.routeNumber || 'N/A'}</p>
              </div>
                )}
              <div className="col-span-2">
                <p className="text-md text-muted-foreground mb-1">Route</p>
                <p className="text-2xl font-semibold truncate">{data.routeName || 'N/A'}</p>
              </div>
              <div>
                <p className="text-md text-muted-foreground mb-1">Departure</p>
                <p className="text-2xl font-semibold">{formatTime(data.departureTime) || 'N/A'}</p>
              </div>
              <div>
                <p className="text-md text-muted-foreground mb-1">Arrival</p>
                <p className="text-2xl font-semibold">{formatTime(data.arrivalTime) || 'N/A'}</p>
              </div>
              <div>
                <p className="text-md text-muted-foreground mb-1">Duration</p>
                <p className="text-2xl font-semibold">{formatDuration(duration || undefined) || 'N/A'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Route Map */}
        <Card className="mb-6">
          <CardContent className="p-0">
            {/* <h2 className="text-xl font-semibold mb-4">Route Map</h2> */}
            {stopsForMap.length >= 2 ? (
              <RouteMap stops={stopsForMap} routeName={data.routeName || 'Route'} />
            ) : (
              <div className="h-64 flex items-center justify-center bg-muted/50 rounded-lg">
                <div className="text-center text-muted-foreground">
                  <MapPin className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Map unavailable - insufficient stop data</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Main Content - Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-6">
          {/* Left Column: Stop List */}
          <Card>
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Stop List</h2>
                <Select value={stopViewMode} onValueChange={(value) => setStopViewMode(value as StopViewMode)}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Select view mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="timings">Stops with timings</SelectItem>
                    <SelectItem value="arrival-departure">Arrival/Departure times</SelectItem>
                    <SelectItem value="all">All stops</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="max-h-[500px] overflow-y-auto pr-2">
                {filteredStops.length > 0 ? (
                  <div className="space-y-3">
                    {filteredStops.map((stop, index) => (
                      <div key={stop.id || index} className="flex gap-4">
                        {/* Time Column */}
                        <div className="flex-shrink-0 w-16">
                          <div className="text-lg font-semibold text-foreground">
                            {formatTime(stop.departureTime || stop.arrivalTime) || '-'}
                          </div>
                        </div>

                        {/* Timeline & Stop Info */}
                        <div className="flex flex-col flex-1">
                          <div className="flex items-start gap-3">
                            {/* Timeline Indicator */}
                            <div className="flex flex-col items-center pt-0.5">
                              <div className={`w-3 h-3 rounded-full ${
                                index === 0 ? 'bg-green-500' : 
                                index === filteredStops.length - 1 ? 'bg-red-500' : 
                                'bg-blue-500'
                              }`} />
                              {index < filteredStops.length - 1 && (
                                <div className="w-0.5 h-9 bg-border mt-1" />
                              )}
                            </div>

                            {/* Stop Details */}
                            <div className="flex-1 min-w-0 bg-gray-200/60 px-3 py-2 rounded-sm">
                              <p className="text-sm font-medium text-foreground truncate">
                                {stop.stopName}
                              </p>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                Stop {stop.stopOrder}
                              </p>
                              
                              {stopViewMode === 'arrival-departure' && (
                                <div className="flex gap-4 mt-2 text-xs">
                                  <div>
                                    <span className="text-muted-foreground">Arr: </span>
                                    <span className="font-medium">
                                      {stop.arrivalTime ? formatTime(stop.arrivalTime) : '-'}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">Dep: </span>
                                    <span className="font-medium">
                                      {stop.departureTime ? formatTime(stop.departureTime) : '-'}
                                    </span>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No stops available for this view mode</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Right Column: Schedule & Bus Details */}
          <div className="space-y-6">
            {/* Schedule Details */}
            {data.operatingDays && data.operatingDays.length > 0 && (
              <Card>
                <CardContent className="p-4 md:p-6">
                  <h2 className="text-xl font-semibold mb-4">Schedule Details</h2>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Operating Days</p>
                      <div className="flex flex-wrap gap-2">
                        {data.operatingDays.map((day) => (
                          <Badge key={day} variant="secondary">
                            {day}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Bus Details */}
            <Card>
              <CardContent className="p-4 md:p-6">
                <h2 className="text-xl font-semibold mb-4">Bus Details</h2>
                <div className="space-y-3">
                  {data.busPlateNumber && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Bus Plate:</span>
                      <span className="font-medium">{data.busPlateNumber}</span>
                    </div>
                  )}
                  {data.operatorName && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Operator:</span>
                      <span className="font-medium">{data.operatorName}</span>
                    </div>
                  )}
                  {data.busModel && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Vehicle Type:</span>
                      <span className="font-medium">{data.busModel}</span>
                    </div>
                  )}
                  {data.busCapacity && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Capacity:</span>
                      <span className="font-medium">{data.busCapacity} passengers</span>
                    </div>
                  )}
                  {data.driverName && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Driver:</span>
                      <span className="font-medium">{data.driverName}</span>
                    </div>
                  )}
                  {data.conductorName && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Conductor:</span>
                      <span className="font-medium">{data.conductorName}</span>
                    </div>
                  )}
                  {data.contactNumber && (
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Contact:</span>
                      <a 
                        href={`tel:${data.contactNumber}`} 
                        className="font-medium text-primary hover:underline flex items-center gap-1"
                      >
                        <Phone className="h-4 w-4" />
                        {data.contactNumber}
                      </a>
                    </div>
                  )}
                  {!data.busPlateNumber && !data.operatorName && !data.busModel && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Bus details not available
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default FindMyBusDetailPage;
