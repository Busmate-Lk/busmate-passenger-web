import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams, useLocation } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import RouteMap from "@/components/RouteMap";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  Clock, 
  MapPin, 
  Bus, 
  ArrowRight, 
  Users, 
  Wifi, 
  Snowflake, 
  Calendar,
  Route,
  ArrowLeft,
  Building2,
  ChevronDown,
  Map,
  Loader2,
  Info,
  CheckCircle2,
  XCircle,
  AlertCircle,
  CalendarDays,
  Timer,
  Navigation
} from "lucide-react";
import { 
  ScheduleManagementService, 
  TripManagementService,
  RouteManagementService
} from "@/generated/api-client/route-management";
import type { 
  ScheduleResponse,
  TripResponse,
  RouteResponse,
  ScheduleStopResponse,
  ScheduleCalendarResponse
} from "@/generated/api-client/route-management";

// Types for unified detail view
type DetailType = 'trip' | 'schedule';

interface UnifiedDetailData {
  type: DetailType;
  id: string;
  date?: string;
  // Common fields
  routeId?: string;
  routeName?: string;
  scheduleName?: string;
  scheduleId?: string;
  status?: string;
  // Trip specific
  tripData?: TripResponse;
  // Schedule specific
  scheduleData?: ScheduleResponse;
  // Route data for additional info
  routeData?: RouteResponse;
}

/**
 * FindMyBusDetailPage - Unified detail page for both trips and schedules
 * 
 * URL Patterns:
 * - /findmybus/trip/{tripId} - Shows trip details
 * - /findmybus/schedule/{scheduleId}?date=YYYY-MM-DD - Shows schedule details for a specific date
 */
const FindMyBusDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Determine type from URL path
  const detailType: DetailType = location.pathname.includes('/findmybus/trip/') ? 'trip' : 'schedule';
  const dateParam = searchParams.get('date') || new Date().toISOString().split('T')[0];
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<UnifiedDetailData | null>(null);
  const [isRouteMapOpen, setIsRouteMapOpen] = useState(false);
  const [isScheduleOpen, setIsScheduleOpen] = useState(true);
  const [isCalendarOpen, setIsCalendarOpen] = useState(true);

  // Fetch data based on type
  useEffect(() => {
    const fetchData = async () => {
      if (!id) {
        setError('Invalid ID provided');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        if (detailType === 'trip') {
          // Fetch trip data
          const tripData = await TripManagementService.getTripById(id);
          
          // Also fetch route data for additional info
          let routeData: RouteResponse | undefined;
          if (tripData.routeId) {
            try {
              routeData = await RouteManagementService.getRouteById(tripData.routeId);
            } catch (err) {
              console.warn('Could not fetch route data:', err);
            }
          }

          // Also fetch schedule data if available
          let scheduleData: ScheduleResponse | undefined;
          if (tripData.scheduleId) {
            try {
              scheduleData = await ScheduleManagementService.getScheduleById(tripData.scheduleId);
            } catch (err) {
              console.warn('Could not fetch schedule data:', err);
            }
          }

          setData({
            type: 'trip',
            id,
            date: tripData.tripDate,
            routeId: tripData.routeId,
            routeName: tripData.routeName,
            scheduleName: tripData.scheduleName,
            scheduleId: tripData.scheduleId,
            status: tripData.status,
            tripData,
            scheduleData,
            routeData
          });
        } else {
          // Fetch schedule data
          const scheduleData = await ScheduleManagementService.getScheduleById(id);
          
          // Also fetch route data for additional info
          let routeData: RouteResponse | undefined;
          if (scheduleData.routeId) {
            try {
              routeData = await RouteManagementService.getRouteById(scheduleData.routeId);
            } catch (err) {
              console.warn('Could not fetch route data:', err);
            }
          }

          setData({
            type: 'schedule',
            id,
            date: dateParam,
            routeId: scheduleData.routeId,
            routeName: scheduleData.routeName,
            scheduleName: scheduleData.name,
            scheduleId: scheduleData.id,
            status: scheduleData.status,
            scheduleData,
            routeData
          });
        }
      } catch (err) {
        console.error('Error fetching detail data:', err);
        setError(`Failed to load ${detailType} details. Please try again.`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, detailType, dateParam]);

  // Helper functions
  const formatTime = (timeString?: string) => {
    if (!timeString) return '';
    try {
      // Handle LocalTime format "HH:mm:ss" or "HH:mm"
      if (timeString.match(/^\d{2}:\d{2}(:\d{2})?$/)) {
        return timeString.substring(0, 5);
      }
      const date = new Date(timeString);
      if (isNaN(date.getTime())) return timeString;
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return timeString;
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      return date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    } catch {
      return dateString;
    }
  };

  const formatDuration = (minutes?: number) => {
    if (!minutes) return '';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  };

  const getStatusBadgeVariant = (status?: string): "default" | "secondary" | "outline" | "destructive" => {
    switch (status?.toLowerCase()) {
      case 'active':
      case 'completed':
        return 'default';
      case 'pending':
      case 'in_transit':
      case 'boarding':
        return 'secondary';
      case 'cancelled':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getDayName = (day: string): string => {
    const days: Record<string, string> = {
      monday: 'Monday',
      tuesday: 'Tuesday',
      wednesday: 'Wednesday',
      thursday: 'Thursday',
      friday: 'Friday',
      saturday: 'Saturday',
      sunday: 'Sunday'
    };
    return days[day] || day;
  };

  // Check if schedule operates on a specific day
  const getOperatingDays = (calendar?: ScheduleCalendarResponse[]): string[] => {
    if (!calendar || calendar.length === 0) return [];
    const cal = calendar[0];
    const days: string[] = [];
    if (cal.monday) days.push('Monday');
    if (cal.tuesday) days.push('Tuesday');
    if (cal.wednesday) days.push('Wednesday');
    if (cal.thursday) days.push('Thursday');
    if (cal.friday) days.push('Friday');
    if (cal.saturday) days.push('Saturday');
    if (cal.sunday) days.push('Sunday');
    return days;
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 container mx-auto px-4">
          <div className="text-center py-12">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Loading {detailType === 'trip' ? 'Trip' : 'Schedule'} Details...
            </h1>
            <p className="text-muted-foreground">Please wait while we fetch the information.</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 container mx-auto px-4">
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-destructive" />
            <h1 className="text-2xl font-bold text-foreground mb-4">Error Loading Details</h1>
            <p className="text-muted-foreground mb-6">{error}</p>
            <div className="flex gap-4 justify-center">
              <Button onClick={() => navigate("/findmybus")} className="bg-gradient-primary">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Search
              </Button>
              <Button onClick={() => window.location.reload()} variant="outline">
                Try Again
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Not found state
  if (!data) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 container mx-auto px-4">
          <div className="text-center py-12">
            <XCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h1 className="text-2xl font-bold text-foreground mb-4">
              {detailType === 'trip' ? 'Trip' : 'Schedule'} Not Found
            </h1>
            <Button onClick={() => navigate("/findmybus")} className="bg-gradient-primary">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Search
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Get stops based on data type
  const getStops = (): ScheduleStopResponse[] => {
    if (data.scheduleData?.scheduleStops) {
      return data.scheduleData.scheduleStops.sort((a, b) => (a.stopOrder || 0) - (b.stopOrder || 0));
    }
    return [];
  };

  const stops = getStops();
  const firstStop = stops[0];
  const lastStop = stops[stops.length - 1];
  const operatingDays = getOperatingDays(data.scheduleData?.scheduleCalendars);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Header Section */}
      <div className="pt-24 pb-8 relative">
        <img
          src="/Autobus-de-luxe.jpg"
          alt="Bus background"
          className="absolute inset-0 w-full h-full object-cover opacity-80 pointer-events-none"
        />
        <div className="absolute inset-0 bg-gradient-hero opacity-90" />

        <div className="container mx-auto px-4 relative z-10">
          <Button 
            variant="ghost" 
            onClick={() => navigate("/findmybus")}
            className="text-white hover:bg-white/10 mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Search Results
          </Button>
          
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 rounded-xl bg-white/10 backdrop-blur-sm">
              {data.type === 'trip' ? (
                <Bus className="h-8 w-8 text-white" />
              ) : (
                <Calendar className="h-8 w-8 text-white" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="secondary" className="text-xs">
                  {data.type === 'trip' ? 'Trip Details' : 'Schedule Details'}
                </Badge>
                <Badge variant={getStatusBadgeVariant(data.status)} className="text-xs">
                  {data.status || 'Unknown'}
                </Badge>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                {data.scheduleName || data.routeName || 'Bus Service'}
              </h1>
              <div className="flex items-center gap-4 text-white/90 flex-wrap">
                {firstStop && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>{firstStop.stopName || 'Origin'}</span>
                  </div>
                )}
                <ArrowRight className="h-4 w-4" />
                {lastStop && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>{lastStop.stopName || 'Destination'}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 items-center">
            {data.routeData?.roadType && (
              <Badge variant="secondary" className="px-3 py-1">
                {data.routeData.roadType}
              </Badge>
            )}
            {data.routeData?.routeGroupName && (
              <Badge variant="outline" className="px-3 py-1 bg-white/10 text-white border-white/30">
                {data.routeData.routeGroupName}
              </Badge>
            )}
            {data.routeData?.estimatedDurationMinutes && (
              <div className="flex items-center gap-1 text-white/90">
                <Clock className="h-4 w-4" />
                <span>{formatDuration(data.routeData.estimatedDurationMinutes)}</span>
              </div>
            )}
            {data.date && (
              <div className="flex items-center gap-1 text-white/90">
                <CalendarDays className="h-4 w-4" />
                <span>{formatDate(data.date)}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          
          {/* Main Details Column */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Trip-Specific Information */}
            {data.type === 'trip' && data.tripData && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bus className="h-5 w-5 text-primary" />
                    Trip Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6 mb-6">
                    {/* Departure */}
                    <div className="text-center p-4 bg-gradient-to-br from-green-500/10 to-green-500/5 rounded-lg border border-green-500/20">
                      <div className="text-2xl font-bold text-green-600">
                        {formatTime(data.tripData.scheduledDepartureTime) || 'TBD'}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {data.tripData.actualDepartureTime ? 'Actual' : 'Scheduled'} Departure
                      </div>
                      <div className="text-sm font-medium text-foreground mt-1">
                        {firstStop?.stopName || 'Origin'}
                      </div>
                    </div>
                    
                    {/* Arrival */}
                    <div className="text-center p-4 bg-gradient-to-br from-red-500/10 to-red-500/5 rounded-lg border border-red-500/20">
                      <div className="text-2xl font-bold text-red-600">
                        {formatTime(data.tripData.scheduledArrivalTime) || 'TBD'}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {data.tripData.actualArrivalTime ? 'Actual' : 'Scheduled'} Arrival
                      </div>
                      <div className="text-sm font-medium text-foreground mt-1">
                        {lastStop?.stopName || 'Destination'}
                      </div>
                    </div>
                  </div>

                  <Separator className="my-4" />

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Trip Date:</span>
                        <span className="font-medium">{formatDate(data.tripData.tripDate)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Trip ID:</span>
                        <span className="font-medium text-xs font-mono">{data.tripData.id?.substring(0, 8)}...</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Status:</span>
                        <Badge variant={getStatusBadgeVariant(data.tripData.status)}>
                          {data.tripData.status || 'Unknown'}
                        </Badge>
                      </div>
                    </div>
                    <div className="space-y-3">
                      {data.tripData.busPlateNumber && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Bus:</span>
                          <span className="font-medium">{data.tripData.busPlateNumber}</span>
                        </div>
                      )}
                      {data.tripData.operatorName && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Operator:</span>
                          <span className="font-medium">{data.tripData.operatorName}</span>
                        </div>
                      )}
                      {data.tripData.permitNumber && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Permit:</span>
                          <span className="font-medium">{data.tripData.permitNumber}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {data.tripData.notes && (
                    <>
                      <Separator className="my-4" />
                      <div className="p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                          <Info className="h-4 w-4" />
                          Notes
                        </div>
                        <p className="text-sm">{data.tripData.notes}</p>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Schedule-Specific Information */}
            {data.type === 'schedule' && data.scheduleData && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    Schedule Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {/* First and Last Stop Times */}
                  {stops.length > 0 && (
                    <div className="grid md:grid-cols-2 gap-6 mb-6">
                      <div className="text-center p-4 bg-gradient-to-br from-green-500/10 to-green-500/5 rounded-lg border border-green-500/20">
                        <div className="text-2xl font-bold text-green-600">
                          {formatTime(firstStop?.departureTime) || formatTime(firstStop?.arrivalTime) || 'TBD'}
                        </div>
                        <div className="text-sm text-muted-foreground">Departure</div>
                        <div className="text-sm font-medium text-foreground mt-1">
                          {firstStop?.stopName || 'First Stop'}
                        </div>
                      </div>
                      
                      <div className="text-center p-4 bg-gradient-to-br from-red-500/10 to-red-500/5 rounded-lg border border-red-500/20">
                        <div className="text-2xl font-bold text-red-600">
                          {formatTime(lastStop?.arrivalTime) || formatTime(lastStop?.departureTime) || 'TBD'}
                        </div>
                        <div className="text-sm text-muted-foreground">Arrival</div>
                        <div className="text-sm font-medium text-foreground mt-1">
                          {lastStop?.stopName || 'Last Stop'}
                        </div>
                      </div>
                    </div>
                  )}

                  <Separator className="my-4" />

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Schedule Name:</span>
                        <span className="font-medium">{data.scheduleData.name}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Schedule Type:</span>
                        <Badge variant="outline">{data.scheduleData.scheduleType}</Badge>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Status:</span>
                        <Badge variant={getStatusBadgeVariant(data.scheduleData.status)}>
                          {data.scheduleData.status}
                        </Badge>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Effective From:</span>
                        <span className="font-medium">{formatDate(data.scheduleData.effectiveStartDate)}</span>
                      </div>
                      {data.scheduleData.effectiveEndDate && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Effective Until:</span>
                          <span className="font-medium">{formatDate(data.scheduleData.effectiveEndDate)}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Total Stops:</span>
                        <span className="font-medium">{stops.length}</span>
                      </div>
                    </div>
                  </div>

                  {data.scheduleData.description && (
                    <>
                      <Separator className="my-4" />
                      <div className="p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                          <Info className="h-4 w-4" />
                          Description
                        </div>
                        <p className="text-sm">{data.scheduleData.description}</p>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Route Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Route className="h-5 w-5 text-primary" />
                  Route Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Route Stats */}
                <div className="grid md:grid-cols-3 gap-4 mb-6">
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <div className="font-semibold">
                      {data.routeData?.distanceKm ? `${data.routeData.distanceKm.toFixed(1)} km` : 'N/A'}
                    </div>
                    <div className="text-xs text-muted-foreground">Total Distance</div>
                  </div>
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <div className="font-semibold">{stops.length || 'N/A'}</div>
                    <div className="text-xs text-muted-foreground">Total Stops</div>
                  </div>
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <div className="font-semibold">
                      {formatDuration(data.routeData?.estimatedDurationMinutes) || 'N/A'}
                    </div>
                    <div className="text-xs text-muted-foreground">Journey Time</div>
                  </div>
                </div>

                {/* Route Info Grid */}
                <div className="grid md:grid-cols-2 gap-4 mb-6">
                  <div className="space-y-2">
                    {data.routeData?.routeNumber && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Route Number:</span>
                        <span className="font-medium">{data.routeData.routeNumber}</span>
                      </div>
                    )}
                    {data.routeData?.name && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Route Name:</span>
                        <span className="font-medium">{data.routeData.name}</span>
                      </div>
                    )}
                    {data.routeData?.direction && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Direction:</span>
                        <Badge variant="outline">{data.routeData.direction}</Badge>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    {data.routeData?.routeGroupName && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Route Group:</span>
                        <span className="font-medium">{data.routeData.routeGroupName}</span>
                      </div>
                    )}
                    {data.routeData?.roadType && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Road Type:</span>
                        <Badge variant="outline">{data.routeData.roadType}</Badge>
                      </div>
                    )}
                  </div>
                </div>

                {data.routeData?.routeThrough && (
                  <div className="p-3 bg-muted/50 rounded-lg mb-4">
                    <div className="text-sm text-muted-foreground mb-1">Via:</div>
                    <p className="text-sm font-medium">{data.routeData.routeThrough}</p>
                  </div>
                )}

                {/* Route Map */}
                {stops.length > 0 && (
                  <>
                    <Separator className="my-4" />
                    <Collapsible open={isRouteMapOpen} onOpenChange={setIsRouteMapOpen}>
                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" className="w-full justify-between p-0 h-auto">
                          <h4 className="font-semibold flex items-center gap-2">
                            <Map className="h-4 w-4 text-primary" />
                            Interactive Route Map
                          </h4>
                          <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isRouteMapOpen ? 'rotate-180' : ''}`} />
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="space-y-3 mt-3">
                        <RouteMap 
                          stops={stops
                            .filter(stop => stop.location?.latitude && stop.location?.longitude)
                            .map(stop => ({
                              name: stop.stopName || '',
                              km: 0,
                              location: stop.location ? {
                                latitude: stop.location.latitude || 0,
                                longitude: stop.location.longitude || 0
                              } : undefined
                            }))}
                          routeName={data.routeName || 'Route'}
                        />
                      </CollapsibleContent>
                    </Collapsible>
                  </>
                )}

                {/* Stop Schedule */}
                {stops.length > 0 && (
                  <>
                    <Separator className="my-4" />
                    <Collapsible open={isScheduleOpen} onOpenChange={setIsScheduleOpen}>
                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" className="w-full justify-between p-0 h-auto">
                          <h4 className="font-semibold flex items-center gap-2">
                            <Timer className="h-4 w-4 text-primary" />
                            Stop Schedule ({stops.length} stops)
                          </h4>
                          <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isScheduleOpen ? 'rotate-180' : ''}`} />
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="space-y-3 mt-3">
                        {stops.map((stop, index) => (
                          <div 
                            key={stop.id || index} 
                            className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-muted/30 to-muted/10 border border-muted/50"
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-3 h-3 rounded-full flex-shrink-0 ${
                                index === 0 ? 'bg-green-500' : 
                                index === stops.length - 1 ? 'bg-red-500' : 'bg-primary'
                              }`}></div>
                              <div>
                                <div className="font-medium">
                                  {stop.stopName}
                                  {index === 0 && <span className="text-xs text-green-600 ml-1">(Origin)</span>}
                                  {index === stops.length - 1 && <span className="text-xs text-red-600 ml-1">(Destination)</span>}
                                </div>
                                <div className="text-xs text-muted-foreground">Stop #{stop.stopOrder || index + 1}</div>
                              </div>
                            </div>
                            <div className="text-right">
                              {stop.arrivalTime && (
                                <div className="font-medium text-primary">{formatTime(stop.arrivalTime)}</div>
                              )}
                              {stop.departureTime && stop.departureTime !== stop.arrivalTime && (
                                <div className="text-xs text-muted-foreground">
                                  Dep: {formatTime(stop.departureTime)}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </CollapsibleContent>
                    </Collapsible>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Operating Calendar (Schedule only) */}
            {data.type === 'schedule' && data.scheduleData?.scheduleCalendars && data.scheduleData.scheduleCalendars.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CalendarDays className="h-5 w-5 text-primary" />
                    Operating Days
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Collapsible open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" className="w-full justify-between p-0 h-auto mb-4">
                        <span className="text-sm text-muted-foreground">
                          {operatingDays.length > 0 
                            ? `Operates on ${operatingDays.length} days per week` 
                            : 'No operating days configured'}
                        </span>
                        <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isCalendarOpen ? 'rotate-180' : ''}`} />
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="grid grid-cols-7 gap-2">
                        {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => {
                          const cal = data.scheduleData?.scheduleCalendars?.[0];
                          const isOperating = cal?.[day as keyof ScheduleCalendarResponse] as boolean;
                          return (
                            <div 
                              key={day}
                              className={`text-center p-3 rounded-lg border ${
                                isOperating 
                                  ? 'bg-green-500/10 border-green-500/30 text-green-700' 
                                  : 'bg-muted/30 border-muted text-muted-foreground'
                              }`}
                            >
                              <div className="text-xs font-medium mb-1">{getDayName(day).substring(0, 3)}</div>
                              {isOperating ? (
                                <CheckCircle2 className="h-4 w-4 mx-auto" />
                              ) : (
                                <XCircle className="h-4 w-4 mx-auto opacity-50" />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>

                  {/* Schedule Exceptions */}
                  {data.scheduleData.scheduleExceptions && data.scheduleData.scheduleExceptions.length > 0 && (
                    <>
                      <Separator className="my-4" />
                      <div>
                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                          <AlertCircle className="h-4 w-4 text-orange-500" />
                          Schedule Exceptions
                        </h4>
                        <div className="space-y-2">
                          {data.scheduleData.scheduleExceptions.map((exception, index) => (
                            <div 
                              key={exception.id || index}
                              className={`flex items-center justify-between p-3 rounded-lg border ${
                                exception.exceptionType === 'ADDED'
                                  ? 'bg-green-500/10 border-green-500/30'
                                  : 'bg-red-500/10 border-red-500/30'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                {exception.exceptionType === 'ADDED' ? (
                                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                                ) : (
                                  <XCircle className="h-4 w-4 text-red-600" />
                                )}
                                <span className="font-medium">{formatDate(exception.exceptionDate)}</span>
                              </div>
                              <Badge variant={exception.exceptionType === 'ADDED' ? 'default' : 'destructive'}>
                                {exception.exceptionType === 'ADDED' ? 'Service Added' : 'Service Removed'}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            
            {/* Quick Info Card */}
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Info className="h-5 w-5 text-primary" />
                  Quick Info
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Journey Summary */}
                <div className="p-4 bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg">
                  <div className="text-center mb-3">
                    <div className="text-sm text-muted-foreground mb-1">From</div>
                    <div className="font-semibold">{firstStop?.stopName || data.routeData?.startStopName || 'Origin'}</div>
                  </div>
                  <div className="flex justify-center">
                    <Navigation className="h-6 w-6 text-primary rotate-180" />
                  </div>
                  <div className="text-center mt-3">
                    <div className="text-sm text-muted-foreground mb-1">To</div>
                    <div className="font-semibold">{lastStop?.stopName || data.routeData?.endStopName || 'Destination'}</div>
                  </div>
                </div>

                <Separator />

                {/* Key Details */}
                <div className="space-y-3 text-sm">
                  {data.date && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Date:</span>
                      <span className="font-medium">{formatDate(data.date)}</span>
                    </div>
                  )}
                  {(firstStop?.departureTime || data.tripData?.scheduledDepartureTime) && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Departure:</span>
                      <span className="font-medium text-green-600">
                        {formatTime(firstStop?.departureTime || data.tripData?.scheduledDepartureTime)}
                      </span>
                    </div>
                  )}
                  {(lastStop?.arrivalTime || data.tripData?.scheduledArrivalTime) && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Arrival:</span>
                      <span className="font-medium text-red-600">
                        {formatTime(lastStop?.arrivalTime || data.tripData?.scheduledArrivalTime)}
                      </span>
                    </div>
                  )}
                  {data.routeData?.distanceKm && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Distance:</span>
                      <span className="font-medium">{data.routeData.distanceKm.toFixed(1)} km</span>
                    </div>
                  )}
                  {data.routeData?.estimatedDurationMinutes && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Duration:</span>
                      <span className="font-medium">{formatDuration(data.routeData.estimatedDurationMinutes)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Stops:</span>
                    <span className="font-medium">{stops.length}</span>
                  </div>
                </div>

                <Separator />

                {/* Operating Days Summary (for schedules) */}
                {data.type === 'schedule' && operatingDays.length > 0 && (
                  <div>
                    <div className="text-sm text-muted-foreground mb-2">Operating Days:</div>
                    <div className="flex flex-wrap gap-1">
                      {operatingDays.map(day => (
                        <Badge key={day} variant="secondary" className="text-xs">
                          {day.substring(0, 3)}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Trip Status (for trips) */}
                {data.type === 'trip' && data.tripData && (
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <div className="text-sm text-muted-foreground mb-1">Trip Status</div>
                    <div className="flex items-center gap-2">
                      <Badge variant={getStatusBadgeVariant(data.tripData.status)}>
                        {data.tripData.status || 'Unknown'}
                      </Badge>
                    </div>
                  </div>
                )}

                <Separator />

                {/* Back to search */}
                <Button 
                  className="w-full bg-gradient-primary hover:opacity-90"
                  onClick={() => navigate("/findmybus")}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Search
                </Button>
              </CardContent>
            </Card>

            {/* Additional Info Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Additional Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <div className="font-medium text-foreground mb-1">
                    {data.type === 'trip' ? 'Trip' : 'Schedule'} ID
                  </div>
                  <div className="text-muted-foreground text-xs font-mono break-all">
                    {data.id}
                  </div>
                </div>
                {data.routeId && (
                  <>
                    <Separator />
                    <div>
                      <div className="font-medium text-foreground mb-1">Route ID</div>
                      <div className="text-muted-foreground text-xs font-mono break-all">
                        {data.routeId}
                      </div>
                    </div>
                  </>
                )}
                {data.scheduleId && data.type === 'trip' && (
                  <>
                    <Separator />
                    <div>
                      <div className="font-medium text-foreground mb-1">Schedule ID</div>
                      <div className="text-muted-foreground text-xs font-mono break-all">
                        {data.scheduleId}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FindMyBusDetailPage;
