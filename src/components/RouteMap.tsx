import { useEffect, useRef, useState } from "react";
import { Loader } from "@googlemaps/js-api-loader";
import { MapPin, Navigation } from "lucide-react";

interface Stop {
  name: string;
  km: number;
}

interface RouteMapProps {
  stops: Stop[];
  routeName: string;
}

const GOOGLE_MAPS_API_KEY = "AIzaSyA14s5MfyKHnIBxCBmMPx8HQ6vVyyL2Tns";

// Mock coordinates for Sri Lankan cities (you would get these from a geocoding service in production)
const mockCoordinates: { [key: string]: { lat: number; lng: number } } = {
  "Colombo Fort": { lat: 6.9319, lng: 79.8478 },
  "Kelaniya": { lat: 6.9553, lng: 79.9222 },
  "Kadawatha": { lat: 7.0108, lng: 79.9500 },
  "Gampaha": { lat: 7.0917, lng: 79.9950 },
  "Veyangoda": { lat: 7.1583, lng: 80.0833 },
  "Polgahawela": { lat: 7.3333, lng: 80.3000 },
  "Kurunegala": { lat: 7.4867, lng: 80.3647 },
  "Dambulla": { lat: 7.8600, lng: 80.6519 },
  "Matale": { lat: 7.4698, lng: 80.6238 },
  "Kandy": { lat: 7.2906, lng: 80.6337 },
  "Rajagiriya": { lat: 6.9067, lng: 79.8942 },
  "Kaduwela": { lat: 6.9333, lng: 79.9833 },
  "Avissawella": { lat: 6.9519, lng: 80.2108 },
  "Ratnapura": { lat: 6.6828, lng: 80.4000 },
  "Balangoda": { lat: 6.6500, lng: 80.6833 },
  "Haputale": { lat: 6.7667, lng: 80.9667 },
  "Bandarawela": { lat: 6.8333, lng: 80.9833 }
};

const RouteMap: React.FC<RouteMapProps> = ({ stops, routeName }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initMap = async () => {
      try {
        const loader = new Loader({
          apiKey: GOOGLE_MAPS_API_KEY,
          version: "weekly",
        });

        const { Map } = await loader.importLibrary("maps");
        const { AdvancedMarkerElement } = await loader.importLibrary("marker");

        if (!mapRef.current) return;

        // Get coordinates for all stops
        const validStops = stops.filter(stop => mockCoordinates[stop.name]);
        
        if (validStops.length === 0) {
          setError("No valid coordinates found for route stops");
          setIsLoading(false);
          return;
        }

        // Calculate center of the route
        const bounds = new google.maps.LatLngBounds();
        validStops.forEach(stop => {
          const coords = mockCoordinates[stop.name];
          bounds.extend(new google.maps.LatLng(coords.lat, coords.lng));
        });

        // Create map
        const mapInstance = new Map(mapRef.current, {
          zoom: 10,
          center: bounds.getCenter(),
          mapId: "route-map", // Required for advanced markers
          styles: [
            {
              featureType: "poi",
              elementType: "labels",
              stylers: [{ visibility: "off" }]
            }
          ]
        });

        // Fit map to bounds
        mapInstance.fitBounds(bounds);

        // Create route path
        const routePath = validStops.map(stop => mockCoordinates[stop.name]);
        
        const routeLine = new google.maps.Polyline({
          path: routePath,
          geodesic: true,
          strokeColor: "#2563eb", // Primary color
          strokeOpacity: 1.0,
          strokeWeight: 4,
        });

        routeLine.setMap(mapInstance);

        // Add markers for each stop
        validStops.forEach((stop, index) => {
          const coords = mockCoordinates[stop.name];
          const isFirst = index === 0;
          const isLast = index === validStops.length - 1;
          
          // Create custom marker element
          const markerDiv = document.createElement('div');
          markerDiv.className = 'flex flex-col items-center';
          markerDiv.innerHTML = `
            <div class="flex flex-col items-center">
              <div class="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg ${
                isFirst ? 'bg-green-500' : isLast ? 'bg-red-500' : 'bg-blue-500'
              }">
                ${isFirst ? 'S' : isLast ? 'E' : index + 1}
              </div>
              <div class="text-xs font-medium text-gray-800 bg-white px-2 py-1 rounded shadow-md mt-1 whitespace-nowrap">
                ${stop.name}
              </div>
            </div>
          `;

          const marker = new AdvancedMarkerElement({
            map: mapInstance,
            position: coords,
            content: markerDiv,
            title: `${stop.name} (${stop.km} km)`
          });

          // Add info window
          const infoWindow = new google.maps.InfoWindow({
            content: `
              <div class="p-2">
                <h3 class="font-semibold text-sm">${stop.name}</h3>
                <p class="text-xs text-gray-600">Distance: ${stop.km} km</p>
                <p class="text-xs text-gray-600">${isFirst ? 'Starting Point' : isLast ? 'End Point' : 'Stop ' + (index + 1)}</p>
              </div>
            `
          });

          marker.addListener("click", () => {
            infoWindow.open(mapInstance, marker);
          });
        });

        setMap(mapInstance);
        setIsLoading(false);
      } catch (err) {
        console.error("Error loading Google Maps:", err);
        setError("Failed to load map. Please check your internet connection.");
        setIsLoading(false);
      }
    };

    initMap();
  }, [stops, routeName]);

  if (error) {
    return (
      <div className="h-64 flex items-center justify-center bg-muted/50 rounded-lg">
        <div className="text-center">
          <MapPin className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm rounded-lg z-10">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Navigation className="h-4 w-4 animate-spin" />
            Loading route map...
          </div>
        </div>
      )}
      <div
        ref={mapRef}
        className="w-full h-64 rounded-lg border"
        style={{ minHeight: "16rem" }}
      />
      <div className="mt-2 text-xs text-muted-foreground text-center">
        {routeName} - Interactive Route Map
      </div>
    </div>
  );
};

export default RouteMap;