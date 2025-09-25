import { useState, useEffect } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
  ArrowLeft, 
  Bus, 
  MapPin, 
  Clock, 
  Star, 
  Users,
  CheckCircle,
  AlertCircle,
  User
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Dummy bus data - in real app this would come from API
const busData = {
  "1": {
    id: "1",
    busNumber: "138",
    operator: "SLTB",
    from: "Colombo Fort", 
    to: "Kandy",
    departure: "06:30 AM",
    arrival: "09:45 AM",
    duration: "3h 15m",
    fare: 280,
    type: "Express",
    rating: 4.2,
    totalSeats: 45,
    seatingLayout: {
      rows: 12,
      seatsPerRow: [4, 4, 4, 4, 4, 4, 3, 3, 3, 3, 3, 3], // Last 6 rows have 3 seats
      seatMap: generateSeatMap(45)
    }
  }
};

// Generate dummy seat availability
function generateSeatMap(totalSeats: number) {
  const seats = [];
  for (let i = 1; i <= totalSeats; i++) {
    seats.push({
      id: i,
      number: i,
      type: i <= 8 ? 'premium' : i <= 32 ? 'regular' : 'economy',
      status: Math.random() > 0.3 ? 'available' : 'occupied', // 70% available
      price: i <= 8 ? 350 : i <= 32 ? 280 : 220
    });
  }
  return seats;
}

// Form schema
const bookingSchema = z.object({
  passengerName: z.string().min(2, "Name must be at least 2 characters").max(50, "Name too long"),
  email: z.string().email("Invalid email address"),
  phone: z.string().regex(/^[0-9+\-\s()]+$/, "Invalid phone number").min(10, "Phone number too short"),
  age: z.coerce.number().min(5, "Age must be at least 5").max(120, "Invalid age"),
  gender: z.string().min(1, "Please select gender"),
  idType: z.string().min(1, "Please select ID type"),
  idNumber: z.string().min(5, "ID number too short").max(20, "ID number too long"),
});

type BookingForm = z.infer<typeof bookingSchema>;

const BookingPage = () => {
  const { tripId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [selectedSeats, setSelectedSeats] = useState<number[]>([]);
  const [currentStep, setCurrentStep] = useState(1); // 1: Select Seats, 2: Passenger Info, 3: Payment
  const [busInfo, setBusInfo] = useState(busData["1" as keyof typeof busData]);
  
  const form = useForm<BookingForm>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      passengerName: "",
      email: "",
      phone: "",
      age: 0,
      gender: "",
      idType: "",
      idNumber: "",
    },
  });

  useEffect(() => {
    // In real app, fetch bus data based on tripId
    if (tripId && busData[tripId as keyof typeof busData]) {
      setBusInfo(busData[tripId as keyof typeof busData]);
    }
  }, [tripId]);

  const handleSeatClick = (seatId: number) => {
    const seat = busInfo.seatingLayout.seatMap.find(s => s.id === seatId);
    if (!seat || seat.status === 'occupied') return;

    setSelectedSeats(prev => {
      if (prev.includes(seatId)) {
        return prev.filter(id => id !== seatId);
      } else if (prev.length < 4) { // Max 4 seats
        return [...prev, seatId];
      } else {
        toast({
          title: "Seat limit reached",
          description: "You can select maximum 4 seats per booking",
          variant: "destructive"
        });
        return prev;
      }
    });
  };

  const getSeatPrice = (seatId: number) => {
    const seat = busInfo.seatingLayout.seatMap.find(s => s.id === seatId);
    return seat?.price || busInfo.fare;
  };

  const totalPrice = selectedSeats.reduce((sum, seatId) => sum + getSeatPrice(seatId), 0);

  const getSeatClass = (seat: any) => {
    let baseClass = "w-8 h-8 m-1 rounded cursor-pointer border text-xs flex items-center justify-center transition-all duration-200 ";
    
    if (seat.status === 'occupied') {
      baseClass += "bg-red-100 border-red-300 cursor-not-allowed text-red-600";
    } else if (selectedSeats.includes(seat.id)) {
      baseClass += "bg-primary text-white border-primary shadow-md scale-105";
    } else {
      switch (seat.type) {
        case 'premium':
          baseClass += "bg-yellow-100 border-yellow-300 hover:bg-yellow-200 text-yellow-800";
          break;
        case 'regular':
          baseClass += "bg-blue-100 border-blue-300 hover:bg-blue-200 text-blue-800";
          break;
        case 'economy':
          baseClass += "bg-green-100 border-green-300 hover:bg-green-200 text-green-800";
          break;
      }
    }
    
    return baseClass;
  };

  const onSubmit = (data: BookingForm) => {
    // Simulate booking process
    toast({
      title: "Booking Confirmed!",
      description: `Your seats ${selectedSeats.join(', ')} have been reserved. Booking reference: BM${Date.now()}`,
    });
    
    // In real app, submit to API and redirect to confirmation page
    setTimeout(() => {
      navigate('/');
    }, 2000);
  };

  const renderSeatMap = () => {
    const { seatMap, seatsPerRow, rows } = busInfo.seatingLayout;
    let seatIndex = 0;

    return (
      <div className="bg-gray-50 p-4 rounded-lg border">
        {/* Driver area */}
        <div className="flex justify-end mb-4 pb-2 border-b border-gray-200">
          <div className="w-16 h-8 bg-gray-300 rounded flex items-center justify-center text-xs">
            Driver
          </div>
        </div>

        {/* Seat rows */}
        <div className="space-y-2">
          {Array.from({ length: rows }, (_, rowIndex) => {
            const seatsInThisRow = seatsPerRow[rowIndex];
            const rowSeats = seatMap.slice(seatIndex, seatIndex + seatsInThisRow);
            seatIndex += seatsInThisRow;

            return (
              <div key={rowIndex} className="flex justify-center gap-2">
                {/* Left side seats */}
                <div className="flex">
                  {rowSeats.slice(0, 2).map((seat) => (
                    <button
                      key={seat.id}
                      onClick={() => handleSeatClick(seat.id)}
                      disabled={seat.status === 'occupied'}
                      className={getSeatClass(seat)}
                      title={`Seat ${seat.number} - Rs. ${seat.price}`}
                    >
                      {seat.number}
                    </button>
                  ))}
                </div>

                {/* Aisle */}
                <div className="w-4"></div>

                {/* Right side seats */}
                <div className="flex">
                  {rowSeats.slice(2).map((seat) => (
                    <button
                      key={seat.id}
                      onClick={() => handleSeatClick(seat.id)}
                      disabled={seat.status === 'occupied'}
                      className={getSeatClass(seat)}
                      title={`Seat ${seat.number} - Rs. ${seat.price}`}
                    >
                      {seat.number}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Header */}
      <div className="pt-24 pb-6 bg-gradient-hero">
        <div className="container mx-auto px-4">
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)}
            className="mb-4 text-white hover:bg-white/20"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Trip Details
          </Button>
          
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold text-white text-center mb-4">
              Book Your Journey
            </h1>
            
            {/* Trip Summary */}
            <Card className="bg-white/10 border-white/20 text-white">
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-white/20">
                      <Bus className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="font-semibold">Bus {busInfo.busNumber} - {busInfo.operator}</div>
                      <div className="text-sm opacity-90">{busInfo.type}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>{busInfo.from}</span>
                    </div>
                    <div className="hidden md:block">→</div>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>{busInfo.to}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{busInfo.departure}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4" />
                      <span>{busInfo.rating}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center">
              {[1, 2, 3].map((step, index) => (
                <div key={step} className="flex items-center">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 text-sm font-semibold
                    ${currentStep >= step 
                      ? 'bg-primary text-white border-primary' 
                      : 'bg-white text-gray-400 border-gray-300'
                    }`}
                  >
                    {currentStep > step ? <CheckCircle className="h-5 w-5" /> : step}
                  </div>
                  {index < 2 && (
                    <div className={`w-16 h-0.5 mx-2 ${currentStep > step ? 'bg-primary' : 'bg-gray-300'}`}></div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {currentStep === 1 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Select Your Seats
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Choose your preferred seats. You can select up to 4 seats.
                    </p>
                  </CardHeader>
                  <CardContent>
                    {/* Legend */}
                    <div className="flex flex-wrap gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2 text-xs">
                        <div className="w-4 h-4 bg-yellow-100 border border-yellow-300 rounded"></div>
                        <span>Premium (Rs. 350)</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <div className="w-4 h-4 bg-blue-100 border border-blue-300 rounded"></div>
                        <span>Regular (Rs. 280)</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <div className="w-4 h-4 bg-green-100 border border-green-300 rounded"></div>
                        <span>Economy (Rs. 220)</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <div className="w-4 h-4 bg-red-100 border border-red-300 rounded"></div>
                        <span>Occupied</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <div className="w-4 h-4 bg-primary border border-primary rounded"></div>
                        <span>Selected</span>
                      </div>
                    </div>

                    {renderSeatMap()}

                    {selectedSeats.length > 0 && (
                      <div className="mt-6 p-4 bg-primary/5 rounded-lg">
                        <h4 className="font-semibold mb-2">Selected Seats:</h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedSeats.map(seatId => {
                            const seat = busInfo.seatingLayout.seatMap.find(s => s.id === seatId);
                            return (
                              <Badge key={seatId} variant="default">
                                Seat {seat?.number} - Rs. {seat?.price}
                              </Badge>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    <Button 
                      className="w-full mt-6" 
                      onClick={() => setCurrentStep(2)}
                      disabled={selectedSeats.length === 0}
                    >
                      Continue to Passenger Information
                    </Button>
                  </CardContent>
                </Card>
              )}

              {currentStep === 2 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Passenger Information
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Please fill in your details for booking confirmation.
                    </p>
                  </CardHeader>
                  <CardContent>
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="passengerName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Full Name *</FormLabel>
                                <FormControl>
                                  <Input placeholder="Enter full name" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email Address *</FormLabel>
                                <FormControl>
                                  <Input type="email" placeholder="Enter email" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="phone"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Phone Number *</FormLabel>
                                <FormControl>
                                  <Input placeholder="Enter phone number" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="age"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Age *</FormLabel>
                                <FormControl>
                                  <Input type="number" placeholder="Enter age" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="gender"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Gender *</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select gender" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="male">Male</SelectItem>
                                    <SelectItem value="female">Female</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="idType"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>ID Type *</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select ID type" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="nic">National ID</SelectItem>
                                    <SelectItem value="passport">Passport</SelectItem>
                                    <SelectItem value="license">Driving License</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="idNumber"
                            render={({ field }) => (
                              <FormItem className="md:col-span-2">
                                <FormLabel>ID Number *</FormLabel>
                                <FormControl>
                                  <Input placeholder="Enter ID number" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="flex gap-4 mt-6">
                          <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => setCurrentStep(1)}
                            className="flex-1"
                          >
                            Back to Seat Selection
                          </Button>
                          <Button type="submit" className="flex-1">
                            Confirm Booking
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Booking Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle className="text-lg">Booking Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Route:</span>
                      <span className="font-medium">{busInfo.from} → {busInfo.to}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Departure:</span>
                      <span className="font-medium">{busInfo.departure}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Duration:</span>
                      <span className="font-medium">{busInfo.duration}</span>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Selected Seats:</span>
                      <span className="font-medium">
                        {selectedSeats.length > 0 ? selectedSeats.join(', ') : 'None'}
                      </span>
                    </div>
                    {selectedSeats.map(seatId => {
                      const seat = busInfo.seatingLayout.seatMap.find(s => s.id === seatId);
                      return (
                        <div key={seatId} className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Seat {seat?.number}:</span>
                          <span className="font-medium">Rs. {seat?.price}</span>
                        </div>
                      );
                    })}
                  </div>

                  <Separator />

                  <div className="flex justify-between text-lg font-bold">
                    <span>Total Amount:</span>
                    <span className="text-primary">Rs. {totalPrice}</span>
                  </div>

                  {selectedSeats.length > 0 && (
                    <div className="text-xs text-muted-foreground text-center">
                      <AlertCircle className="h-3 w-3 inline mr-1" />
                      Seats will be held for 15 minutes
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;