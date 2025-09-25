import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import RouteMap from "@/components/RouteMap";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  Clock, 
  MapPin, 
  Bus, 
  ArrowRight, 
  Star, 
  Users, 
  Wifi, 
  Snowflake, 
  Tv, 
  Coffee,
  Shield,
  Phone,
  Calendar,
  Route,
  ArrowLeft,
  Fuel,
  Settings,
  Building2,
  UserCheck,
  Calculator,
  ChevronDown,
  Map
} from "lucide-react";

// Extended trip data with detailed information
const tripDetailsData = {
  "1": {
    id: "1",
    busNumber: "138",
    operator: {
      name: "SLTB",
      type: "Government",
      license: "PSP-001-2024",
      contact: "+94 11 269 4000",
      rating: 4.2
    },
    from: "Colombo Fort",
    to: "Kandy",
    departure: "06:30 AM",
    arrival: "09:45 AM",
    duration: "3h 15m",
    fare: "Rs. 280",
    type: "Express",
    rating: 4.2,
    amenities: ["AC", "WiFi", "Comfortable Seats"],
    route: {
      id: "R001",
      name: "Colombo-Kandy Highway Route",
      totalDistance: "115 km",
      stops: [
        { name: "Colombo Fort", km: 0 },
        { name: "Kelaniya", km: 12 },
        { name: "Kadawatha", km: 18 },
        { name: "Gampaha", km: 30 },
        { name: "Veyangoda", km: 42 },
        { name: "Polgahawela", km: 58 },
        { name: "Kurunegala", km: 75 },
        { name: "Dambulla", km: 95 },
        { name: "Matale", km: 105 },
        { name: "Kandy", km: 115 }
      ],
      routeType: "Highway Route"
    },
    schedule: {
      id: "S001",
      frequency: "Every 30 minutes",
      firstTrip: "05:00 AM",
      lastTrip: "10:00 PM",
      weekdayService: "Monday - Sunday",
      peakHours: "7:00 AM - 9:00 AM, 5:00 PM - 7:00 PM",
      stopTimes: {
        "Colombo Fort": "06:30 AM",
        "Kelaniya": "06:45 AM",
        "Gampaha": "07:15 AM",
        "Polgahawela": "08:00 AM",
        "Kurunegala": "08:30 AM",
        "Matale": "09:30 AM",
        "Kandy": "09:45 AM"
      }
    },
    bus: {
      model: "Tata Ultra 1518",
      year: "2022",
      capacity: 45,
      plateNumber: "NC-1234",
      fuelType: "Diesel",
      features: ["Air Conditioning", "GPS Tracking", "Emergency Exits", "Fire Extinguisher"],
      condition: "Excellent",
      lastMaintenance: "2024-01-15"
    },
    staff: {
      driver: {
        name: "Sunil Perera",
        experience: "12 years",
        rating: 4.8,
        contact: "+94 77 123 4567",
        license: "DL-123456"
      },
      conductor: {
        name: "Nimal Silva",
        experience: "8 years",
        rating: 4.6,
        contact: "+94 71 234 5678",
        badge: "CD-789"
      }
    },
    fareStructure: {
      baseRate: 2.5, // Rs per km
      adult: 1.0,
      child: 0.5,
      senior: 0.8,
      student: 0.8
    },
    policies: {
      cancellation: "Free cancellation up to 2 hours before departure",
      luggage: "20kg free baggage allowance",
      pets: "Small pets allowed in carriers",
      smoking: "Strictly prohibited",
      ticketing: "Digital and physical tickets accepted",
      boarding: "First come, first served basis"
    }
  },
  "2": {
    id: "2",
    busNumber: "1-1",
    operator: {
      name: "Private Express Lines",
      type: "Private",
      license: "PSP-002-2024",
      contact: "+94 11 555 0000",
      rating: 4.5
    },
    from: "Colombo Fort",
    to: "Kandy",
    departure: "07:00 AM",
    arrival: "10:30 AM",
    duration: "3h 30m",
    fare: "Rs. 350",
    type: "Luxury",
    rating: 4.5,
    amenities: ["AC", "WiFi", "Reclining Seats", "Entertainment"],
    route: {
      id: "R002",
      name: "Colombo-Kandy Scenic Route",
      totalDistance: "120 km",
      stops: [
        { name: "Colombo Fort", km: 0 },
        { name: "Rajagiriya", km: 15 },
        { name: "Kaduwela", km: 25 },
        { name: "Avissawella", km: 40 },
        { name: "Ratnapura", km: 65 },
        { name: "Balangoda", km: 85 },
        { name: "Haputale", km: 100 },
        { name: "Bandarawela", km: 108 },
        { name: "Kandy", km: 120 }
      ],
      routeType: "Scenic Route"
    },
    schedule: {
      id: "S002",
      frequency: "Every 45 minutes",
      firstTrip: "06:00 AM",
      lastTrip: "09:00 PM",
      weekdayService: "Monday - Sunday",
      peakHours: "7:00 AM - 9:00 AM, 5:00 PM - 7:00 PM",
      stopTimes: {
        "Colombo Fort": "07:00 AM",
        "Rajagiriya": "07:20 AM",
        "Avissawella": "08:10 AM",
        "Ratnapura": "09:00 AM",
        "Balangoda": "09:45 AM",
        "Haputale": "10:15 AM",
        "Kandy": "10:30 AM"
      }
    },
    bus: {
      model: "Mercedes-Benz Tourismo",
      year: "2023",
      capacity: 35,
      plateNumber: "WP-5678",
      fuelType: "Diesel",
      features: ["Luxury Reclining Seats", "Individual Entertainment Systems", "USB Charging", "Reading Lights", "Footrests"],
      condition: "Brand New",
      lastMaintenance: "2024-01-20"
    },
    staff: {
      driver: {
        name: "Kamal Silva",
        experience: "15 years",
        rating: 4.9,
        contact: "+94 71 987 6543",
        license: "DL-654321"
      },
      conductor: {
        name: "Ravi Fernando",
        experience: "10 years",
        rating: 4.7,
        contact: "+94 77 345 6789",
        badge: "CD-456"
      }
    },
    fareStructure: {
      baseRate: 3.0, // Rs per km
      adult: 1.0,
      child: 0.5,
      senior: 0.8,
      student: 0.8
    },
    policies: {
      cancellation: "Free cancellation up to 1 hour before departure",
      luggage: "25kg free baggage allowance",
      pets: "Pets allowed with prior notification",
      smoking: "Strictly prohibited",
      ticketing: "Digital tickets only",
      boarding: "Reserved seating available"
    }
  }
};

const TripDetails = () => {
  const { tripId } = useParams<{ tripId: string }>();
  const navigate = useNavigate();
  const [tripData, setTripData] = useState<any>(null);
  const [fromStop, setFromStop] = useState("");
  const [toStop, setToStop] = useState("");
  const [passengerType, setPassengerType] = useState("adult");
  const [calculatedFare, setCalculatedFare] = useState(0);
  const [isRouteMapOpen, setIsRouteMapOpen] = useState(false);
  const [isScheduleOpen, setIsScheduleOpen] = useState(true);

  useEffect(() => {
    if (tripId && tripDetailsData[tripId as keyof typeof tripDetailsData]) {
      setTripData(tripDetailsData[tripId as keyof typeof tripDetailsData]);
    }
  }, [tripId]);

  const calculateFare = () => {
    if (!fromStop || !toStop || !tripData) return;
    
    const fromStopData = tripData.route.stops.find((stop: any) => stop.name === fromStop);
    const toStopData = tripData.route.stops.find((stop: any) => stop.name === toStop);
    
    if (!fromStopData || !toStopData) return;
    
    const distance = Math.abs(toStopData.km - fromStopData.km);
    const baseFare = distance * tripData.fareStructure.baseRate;
    const multiplier = tripData.fareStructure[passengerType];
    
    setCalculatedFare(Math.round(baseFare * multiplier));
  };

  useEffect(() => {
    calculateFare();
  }, [fromStop, toStop, passengerType, tripData]);

  if (!tripData) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">Trip Not Found</h1>
            <Button onClick={() => navigate("/search")} className="bg-gradient-primary">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Search
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const getAmenityIcon = (amenity: string) => {
    switch (amenity.toLowerCase()) {
      case 'ac':
      case 'air conditioning':
        return <Snowflake className="h-4 w-4" />;
      case 'wifi':
        return <Wifi className="h-4 w-4" />;
      case 'entertainment':
        return <Tv className="h-4 w-4" />;
      case 'comfortable seats':
      case 'reclining seats':
        return <Users className="h-4 w-4" />;
      default:
        return <Settings className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Header Section */}
      <div className="pt-24 pb-8 bg-gradient-hero">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <Button 
              variant="ghost" 
              onClick={() => navigate("/search")}
              className="text-white hover:bg-white/10 mb-6"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Search Results
            </Button>
            
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 rounded-xl bg-white/10 backdrop-blur-sm">
                <Bus className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                  Bus {tripData.busNumber} - {tripData.operator.name}
                </h1>
                <div className="flex items-center gap-4 text-white/90">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>{tripData.from}</span>
                  </div>
                  <ArrowRight className="h-4 w-4" />
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>{tripData.to}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 items-center">
              <Badge variant={tripData.type === "Luxury" ? "default" : "secondary"} className="px-3 py-1">
                {tripData.type}
              </Badge>
              <div className="flex items-center gap-1 text-white/90">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span>{tripData.rating}</span>
              </div>
              <div className="flex items-center gap-1 text-white/90">
                <Clock className="h-4 w-4" />
                <span>{tripData.duration}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-6">
            
            {/* Main Details Column */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Route and Schedule Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Route className="h-5 w-5 text-primary" />
                    Route & Schedule Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Main Departure/Arrival - Keep at top for readability */}
                  <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <div className="text-center p-4 bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg">
                      <div className="text-2xl font-bold text-primary">{tripData.departure}</div>
                      <div className="text-sm text-muted-foreground">Departure Time</div>
                      <div className="text-sm font-medium text-foreground mt-1">{tripData.from}</div>
                    </div>
                    
                    <div className="text-center p-4 bg-gradient-to-br from-secondary/5 to-secondary/10 rounded-lg">
                      <div className="text-2xl font-bold text-secondary">{tripData.arrival}</div>
                      <div className="text-sm text-muted-foreground">Arrival Time</div>
                      <div className="text-sm font-medium text-foreground mt-1">{tripData.to}</div>
                    </div>
                  </div>
                  
                  <Separator className="my-4" />
                  
                  {/* Route Information */}
                  <div className="grid md:grid-cols-3 gap-4 mb-6">
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <div className="font-semibold">{tripData.route.totalDistance}</div>
                      <div className="text-xs text-muted-foreground">Total Distance</div>
                    </div>
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <div className="font-semibold">{tripData.route.stops.length}</div>
                      <div className="text-xs text-muted-foreground">Total Stops</div>
                    </div>
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <div className="font-semibold">{tripData.duration}</div>
                      <div className="text-xs text-muted-foreground">Journey Time</div>
                    </div>
                  </div>
                  
                  {/* Collapsible Route Map */}
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
                        stops={tripData.route.stops} 
                        routeName={tripData.route.name}
                      />
                    </CollapsibleContent>
                  </Collapsible>

                  <Separator className="my-4" />
                  
                  {/* Collapsible Detailed Schedule with Stops */}
                  <Collapsible open={isScheduleOpen} onOpenChange={setIsScheduleOpen}>
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" className="w-full justify-between p-0 h-auto">
                        <h4 className="font-semibold">Scheduled Stop Times</h4>
                        <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isScheduleOpen ? 'rotate-180' : ''}`} />
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-3 mt-3">
                      {tripData.route.stops.map((stop: any, index: number) => (
                        <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-muted/30 to-muted/10 border border-muted/50">
                          <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full bg-primary flex-shrink-0"></div>
                            <div>
                              <div className="font-medium">{stop.name}</div>
                              <div className="text-xs text-muted-foreground">{stop.km} km</div>
                            </div>
                          </div>
                          <div className="text-right">
                            {tripData.schedule.stopTimes[stop.name] ? (
                              <div className="font-medium text-primary">{tripData.schedule.stopTimes[stop.name]}</div>
                            ) : (
                              <div className="text-xs text-muted-foreground">No scheduled time</div>
                            )}
                          </div>
                        </div>
                      ))}
                    </CollapsibleContent>
                  </Collapsible>
                  
                  <Separator className="my-4" />
                  
                  {/* Schedule Information */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Route ID:</span>
                        <span className="font-medium">{tripData.route.id}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Schedule ID:</span>
                        <span className="font-medium">{tripData.schedule.id}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Frequency:</span>
                        <span className="font-medium">{tripData.schedule.frequency}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Service Hours:</span>
                        <span className="font-medium">{tripData.schedule.firstTrip} - {tripData.schedule.lastTrip}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Peak Hours:</span>
                        <span className="font-medium text-xs">{tripData.schedule.peakHours}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Service Days:</span>
                        <span className="font-medium">{tripData.schedule.weekdayService}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Bus and Operator Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-primary" />
                    Bus & Operator Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Operator Information */}
                    <div className="space-y-4">
                      <div className="p-4 bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg">
                        <h4 className="font-semibold text-primary mb-3">Operator Information</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Name:</span>
                            <span className="font-medium">{tripData.operator.name}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Type:</span>
                            <Badge variant="outline" className="text-xs">{tripData.operator.type}</Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">License:</span>
                            <span className="font-medium text-xs">{tripData.operator.license}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Contact:</span>
                            <span className="font-medium text-xs">{tripData.operator.contact}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Rating:</span>
                            <div className="flex items-center gap-1">
                              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                              <span className="font-medium">{tripData.operator.rating}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Bus Information */}
                    <div className="space-y-4">
                      <div className="p-4 bg-gradient-to-br from-secondary/5 to-secondary/10 rounded-lg">
                        <h4 className="font-semibold text-secondary mb-3">Bus Information</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Model:</span>
                            <span className="font-medium">{tripData.bus.model}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Year:</span>
                            <span className="font-medium">{tripData.bus.year}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Capacity:</span>
                            <span className="font-medium">{tripData.bus.capacity} passengers</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Plate:</span>
                            <span className="font-medium">{tripData.bus.plateNumber}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Condition:</span>
                            <Badge variant="outline" className="text-xs">{tripData.bus.condition}</Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <Separator className="my-4" />
                  
                  {/* Bus Features */}
                  <div>
                    <h4 className="font-semibold mb-3">Bus Features & Amenities</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {[...tripData.bus.features, ...tripData.amenities].map((feature: string, index: number) => (
                        <div key={index} className="flex items-center gap-2 text-sm p-2 rounded-lg bg-muted/50">
                          {getAmenityIcon(feature)}
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Staff Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserCheck className="h-5 w-5 text-primary" />
                    Staff Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Driver Information */}
                    <div className="p-4 bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg">
                      <h4 className="font-semibold text-primary mb-3 flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Driver
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Name:</span>
                          <span className="font-medium">{tripData.staff.driver.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Experience:</span>
                          <span className="font-medium">{tripData.staff.driver.experience}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">License:</span>
                          <span className="font-medium">{tripData.staff.driver.license}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Rating:</span>
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            <span className="font-medium">{tripData.staff.driver.rating}</span>
                          </div>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Contact:</span>
                          <span className="font-medium text-xs">{tripData.staff.driver.contact}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Conductor Information */}
                    <div className="p-4 bg-gradient-to-br from-secondary/5 to-secondary/10 rounded-lg">
                      <h4 className="font-semibold text-secondary mb-3 flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        Conductor
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Name:</span>
                          <span className="font-medium">{tripData.staff.conductor.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Experience:</span>
                          <span className="font-medium">{tripData.staff.conductor.experience}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Badge:</span>
                          <span className="font-medium">{tripData.staff.conductor.badge}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Rating:</span>
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            <span className="font-medium">{tripData.staff.conductor.rating}</span>
                          </div>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Contact:</span>
                          <span className="font-medium text-xs">{tripData.staff.conductor.contact}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Booking Sidebar */}
            <div className="space-y-6">
              
              {/* Fare Calculator */}
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="h-5 w-5 text-primary" />
                    Fare Calculator
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-3">
                    <div>
                      <label className="text-sm font-medium mb-1 block">From Stop</label>
                      <Select value={fromStop} onValueChange={setFromStop}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select starting stop" />
                        </SelectTrigger>
                        <SelectContent>
                          {tripData.route.stops.map((stop: any, index: number) => (
                            <SelectItem key={index} value={stop.name}>{stop.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium mb-1 block">To Stop</label>
                      <Select value={toStop} onValueChange={setToStop}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select destination stop" />
                        </SelectTrigger>
                        <SelectContent>
                          {tripData.route.stops.map((stop: any, index: number) => (
                            <SelectItem key={index} value={stop.name}>{stop.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium mb-1 block">Passenger Type</label>
                      <Select value={passengerType} onValueChange={setPassengerType}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="adult">Adult</SelectItem>
                          <SelectItem value="child">Child (5-12)</SelectItem>
                          <SelectItem value="senior">Senior (60+)</SelectItem>
                          <SelectItem value="student">Student</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  {calculatedFare > 0 && (
                    <div className="text-center p-4 bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg">
                      <div className="text-2xl font-bold text-primary">Rs. {calculatedFare}</div>
                      <div className="text-sm text-muted-foreground">Calculated Fare</div>
                    </div>
                  )}
                  
                  <Separator />
                  
                  <div className="space-y-3">
                    <h4 className="font-semibold text-sm">Standard Fare (Full Route)</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Adult:</span>
                        <span className="font-medium">Rs. {Math.round(tripData.route.stops[tripData.route.stops.length - 1].km * tripData.fareStructure.baseRate * tripData.fareStructure.adult)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Child (5-12):</span>
                        <span className="font-medium">Rs. {Math.round(tripData.route.stops[tripData.route.stops.length - 1].km * tripData.fareStructure.baseRate * tripData.fareStructure.child)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Senior (60+):</span>
                        <span className="font-medium">Rs. {Math.round(tripData.route.stops[tripData.route.stops.length - 1].km * tripData.fareStructure.baseRate * tripData.fareStructure.senior)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Student:</span>
                        <span className="font-medium">Rs. {Math.round(tripData.route.stops[tripData.route.stops.length - 1].km * tripData.fareStructure.baseRate * tripData.fareStructure.student)}</span>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground text-center">
                      Rate: Rs. {tripData.fareStructure.baseRate}/km
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <Button 
                    className="w-full bg-gradient-primary hover:opacity-90"
                    onClick={() => window.location.href = `/booking/${tripData.id}`}
                  >
                    Book Now
                  </Button>
                  
                  <div className="text-center">
                    <Button variant="ghost" size="sm" className="text-muted-foreground">
                      <Phone className="h-4 w-4 mr-2" />
                      Call: {tripData.staff.driver.contact}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Travel and Ticketing Policies */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Travel & Ticketing Policies</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div>
                    <div className="font-medium text-foreground mb-1">Cancellation Policy</div>
                    <div className="text-muted-foreground text-xs">{tripData.policies.cancellation}</div>
                  </div>
                  <Separator />
                  <div>
                    <div className="font-medium text-foreground mb-1">Ticketing System</div>
                    <div className="text-muted-foreground text-xs">{tripData.policies.ticketing}</div>
                  </div>
                  <Separator />
                  <div>
                    <div className="font-medium text-foreground mb-1">Boarding Policy</div>
                    <div className="text-muted-foreground text-xs">{tripData.policies.boarding}</div>
                  </div>
                  <Separator />
                  <div>
                    <div className="font-medium text-foreground mb-1">Luggage Policy</div>
                    <div className="text-muted-foreground text-xs">{tripData.policies.luggage}</div>
                  </div>
                  <Separator />
                  <div>
                    <div className="font-medium text-foreground mb-1">Pet Policy</div>
                    <div className="text-muted-foreground text-xs">{tripData.policies.pets}</div>
                  </div>
                  <Separator />
                  <div>
                    <div className="font-medium text-foreground mb-1">Smoking Policy</div>
                    <div className="text-muted-foreground text-xs">{tripData.policies.smoking}</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TripDetails;