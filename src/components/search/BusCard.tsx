import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, BusFront, Clock, ArrowRight, Route } from "lucide-react";
import type { BusResult } from "@/generated/api-client/route-management";

interface BusCardProps {
  bus: BusResult;
  fromStopName?: string;
  toStopName?: string;
  searchDate?: string;
  onViewDetails?: () => void;
}

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



// Helper function to get departure time
const getDepartureTime = (bus: BusResult) => {
  return bus.actualDepartureTime || bus.scheduledDepartureAtOrigin || null;
};

// Helper function to get arrival time
const getArrivalTime = (bus: BusResult) => {
  return bus.actualArrivalTime || bus.scheduledArrivalAtDestination || null;
};

export default function BusCard({ bus, fromStopName, toStopName, searchDate, onViewDetails }: BusCardProps) {
  const departureTime = getDepartureTime(bus);
  const arrivalTime = getArrivalTime(bus);

  // Determine button action - prioritize trip, then schedule, then route
  const getDetailLink = () => {
    if (bus.tripId) {
      return `/findmybus/detail?type=trip&id=${bus.tripId}`;
    } else if (bus.scheduleId) {
      return `/findmybus/detail?type=schedule&id=${bus.scheduleId}&date=${searchDate || new Date().toISOString().split('T')[0]}`;
    } else if (bus.routeId) {
      return `/route/${bus.routeId}`;
    }
    return null;
  };

  return (
    <Card className="hover:shadow-lg transition-all duration-300 border border-border rounded-xl w-full bg-card">
      <CardContent className="p-5 sm:p-6 space-y-5">
        {/* ROUTE HEADER */}
        <div className="flex items-start gap-4">
          <BusFront className="h-12 w-12 text-primary flex-shrink-0" />

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              {bus.routeNumber && (
                <Badge variant="secondary" className="text-sm px-2 py-0.5">
                  {bus.routeNumber}
                </Badge>
              )}

              <div className="flex justify-between w-full sm:w-auto flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-foreground truncate">
                  {bus.routeName || 'Route Information'}
                </h3>

                {/* Show departure and arrival time for route */}
                {departureTime && arrivalTime && (
                  <div className="flex items-center gap-1 text-md text-muted-foreground">
                    <span>{formatTime(departureTime)}</span>
                    <ArrowRight className="h-4 w-4" />
                    <span>{formatTime(arrivalTime)}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-between items-start mt-2">
              {/* Show route through */}
              {bus.routeThrough && (
                <span className="flex items-center gap-1 text-sm text-muted-foreground">
                  <i>via</i> {bus.routeThrough}
                </span>
              )}
              
              <div className="flex gap-2 flex-wrap">
                {/* Distance badge */}
                {bus.distanceKm && (
                  <Badge variant="outline" className="text-xs">
                    {bus.distanceKm.toFixed(1)} km
                  </Badge>
                )}
                
                {/* Road type badge */}
                {bus.roadType && (
                  <Badge variant="outline" className="text-xs">
                    {bus.roadType}
                  </Badge>
                )}
              </div>
            </div>

            {/* Additional badges for operator and trip status */}
            <div className="flex gap-2 flex-wrap mt-2">
              {bus.operatorName && (
                <Badge variant="secondary" className="text-xs">
                  {bus.operatorName}
                </Badge>
              )}
              {bus.tripStatus && (
                <Badge variant="outline" className="text-xs">
                  {bus.tripStatus}
                </Badge>
              )}
            </div>

            {/* Bus Details */}
            {(bus.busPlateNumber || bus.busModel || bus.busCapacity) && (
              <div className="flex flex-wrap gap-2 mt-2">
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

            {/* Custom message for missing bus or operator details */}
            {(() => {
              const hasBusDetails = bus.busPlateNumber || bus.busModel || bus.busCapacity;
              const hasOperatorDetails = bus.operatorName;
              
              if (!hasBusDetails && !hasOperatorDetails) {
                return (
                  <p className="text-sm text-amber-600 italic mt-2">
                    Bus and operator information not available for this route
                  </p>
                );
              }
              if (!hasBusDetails) {
                return (
                  <p className="text-sm text-amber-600 italic mt-2">
                    Bus information not available
                  </p>
                );
              }
              if (!hasOperatorDetails) {
                return (
                  <p className="text-sm text-amber-600 italic mt-2">
                    Operator information not available
                  </p>
                );
              }
              return null;
            })()}
          </div>
        </div>

        {/* Show specific info between searched locations */}
        <hr className="my-4 border-border" />

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 text-lg">
          {/* From location and expected timing */}
          <div>
            <span className="text-foreground text-md mb-1 flex items-center gap-1">
              <MapPin className="h-4 w-4 flex-shrink-0" />
              {fromStopName || 'Origin'}
            </span>
            {departureTime && (
              <div className="pl-5">
                <span className="font-bold">{formatTime(departureTime)}</span>
              </div>
            )}
          </div>

          {/* To location and expected timing */}
          <div>
            <span className="text-foreground text-md mb-1 flex items-center gap-1">
              <MapPin className="h-4 w-4 flex-shrink-0" />
              {toStopName || 'Destination'}
            </span>
            {arrivalTime && (
              <div className="pl-5">
                <span className="font-bold">{formatTime(arrivalTime)}</span>
              </div>
            )}
          </div>

          {/* Duration between from and to locations */}
          <div>
            <span className="text-foreground text-md mb-1 flex items-center gap-1">
              <Clock className="h-4 w-4 inline-block mr-1" />
              Duration
            </span>
            <span className="font-bold pl-5">
              {formatDuration(bus.estimatedDurationMinutes)}
            </span>
          </div>

          {/* Distance between from and to locations */}
          <div>
            <span className="text-foreground text-md mb-1 flex items-center gap-1">
              <Route className="h-4 w-4 inline-block mr-1" />
              Distance
            </span>
            <span className="font-bold pl-5">
              {bus.distanceKm ? `${bus.distanceKm.toFixed(1)} km` : 'N/A'}
            </span>
          </div>

          {/* Action button to see more details */}
          <div className="flex items-end justify-end">
            {getDetailLink() ? (
              <Button
                className="bg-gradient-primary hover:opacity-90 px-4 py-3 text-sm font-semibold text-white rounded-lg transition-all duration-300"
                onClick={() => {
                  if (onViewDetails) {
                    onViewDetails();
                  } else {
                    window.location.href = getDetailLink()!;
                  }
                }}
              >
                View Details
              </Button>
            ) : (
              <Button
                variant="outline"
                className="px-4 py-3 text-sm font-semibold rounded-lg transition-all duration-300"
                disabled
              >
                No Details
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
