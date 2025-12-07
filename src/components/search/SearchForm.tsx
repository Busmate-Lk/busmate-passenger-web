import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, MapPin, ArrowRight, Loader2 } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { PassengerApIsService } from "@/generated/api-client/route-management";
import type { PassengerStopResponse } from "@/generated/api-client/route-management";

interface SearchFormProps {
  variant?: "hero" | "page";
  // Optional initial values (used when navigating to the search page via URL or location.state)
  initialFromText?: string;
  initialToText?: string;
  initialFromStopId?: string;
  initialToStopId?: string;
}

interface StopOption {
  id: string;
  name: string;
  city: string;
}

const SearchForm = ({
  variant = "hero",
  initialFromText,
  initialToText,
  initialFromStopId,
  initialToStopId,
}: SearchFormProps) => {
  const [fromText, setFromText] = useState(initialFromText || "");
  const [toText, setToText] = useState(initialToText || "");
  const [fromStopId, setFromStopId] = useState(initialFromStopId || "");
  const [toStopId, setToStopId] = useState(initialToStopId || "");
  const [fromStops, setFromStops] = useState<StopOption[]>([]);
  const [toStops, setToStops] = useState<StopOption[]>([]);
  const [fromLoading, setFromLoading] = useState(false);
  const [toLoading, setToLoading] = useState(false);
  const [showFromDropdown, setShowFromDropdown] = useState(false);
  const [showToDropdown, setShowToDropdown] = useState(false);
  const [fromDebounceTimer, setFromDebounceTimer] = useState<NodeJS.Timeout | null>(null);
  const [toDebounceTimer, setToDebounceTimer] = useState<NodeJS.Timeout | null>(null);
  
  const fromDropdownRef = useRef<HTMLDivElement>(null);
  const toDropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Search stops function
  const searchStops = async (query: string, type: 'from' | 'to') => {
    if (query.length < 2) {
      if (type === 'from') {
        setFromStops([]);
        setShowFromDropdown(false);
      } else {
        setToStops([]);
        setShowToDropdown(false);
      }
      return;
    }

    try {
      if (type === 'from') {
        setFromLoading(true);
      } else {
        setToLoading(true);
      }

      const response = await PassengerApIsService.searchStops(
        undefined, // name
        undefined, // city
        query, // searchText
        undefined, // accessibleOnly
        0, // page
        10 // size
      );

      const stops = response.content?.map(stop => ({
        id: stop.stopId || '',
        name: stop.name || '',
        city: stop.city || ''
      })) || [];

      if (type === 'from') {
        setFromStops(stops);
        setShowFromDropdown(true);
      } else {
        setToStops(stops);
        setShowToDropdown(true);
      }
    } catch (error) {
      console.error('Error searching stops:', error);
    } finally {
      if (type === 'from') {
        setFromLoading(false);
      } else {
        setToLoading(false);
      }
    }
  };

  // Debounced search
  const handleFromTextChange = (value: string) => {
    setFromText(value);
    setFromStopId(''); // Clear selected stop when typing
    
    if (fromDebounceTimer) {
      clearTimeout(fromDebounceTimer);
    }
    
    const timer = setTimeout(() => {
      searchStops(value, 'from');
    }, 300);
    
    setFromDebounceTimer(timer);
  };

  const handleToTextChange = (value: string) => {
    setToText(value);
    setToStopId(''); // Clear selected stop when typing
    
    if (toDebounceTimer) {
      clearTimeout(toDebounceTimer);
    }
    
    const timer = setTimeout(() => {
      searchStops(value, 'to');
    }, 300);
    
    setToDebounceTimer(timer);
  };

  // Select stop
  const selectFromStop = (stop: StopOption) => {
    setFromText(stop.name);
    setFromStopId(stop.id);
    setShowFromDropdown(false);
  };

  const selectToStop = (stop: StopOption) => {
    setToText(stop.name);
    setToStopId(stop.id);
    setShowToDropdown(false);
  };

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (fromDropdownRef.current && !fromDropdownRef.current.contains(event.target as Node)) {
        setShowFromDropdown(false);
      }
      if (toDropdownRef.current && !toDropdownRef.current.contains(event.target as Node)) {
        setShowToDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Cleanup timers
  useEffect(() => {
    return () => {
      if (fromDebounceTimer) clearTimeout(fromDebounceTimer);
      if (toDebounceTimer) clearTimeout(toDebounceTimer);
    };
  }, [fromDebounceTimer, toDebounceTimer]);

  // Sync when parent provides new initial values (e.g., when SearchResults reads URL params)
  useEffect(() => {
    if (initialFromText !== undefined) setFromText(initialFromText);
    if (initialToText !== undefined) setToText(initialToText);
    if (initialFromStopId !== undefined) setFromStopId(initialFromStopId);
    if (initialToStopId !== undefined) setToStopId(initialToStopId);
  }, [initialFromText, initialToText, initialFromStopId, initialToStopId]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (fromStopId && toStopId) {
      navigate(`/search?fromStopId=${encodeURIComponent(fromStopId)}&toStopId=${encodeURIComponent(toStopId)}&fromName=${encodeURIComponent(fromText)}&toName=${encodeURIComponent(toText)}`);
    } else if (fromText.trim() || toText.trim()) {
      // Fallback for partial text search
      navigate(`/search?fromText=${encodeURIComponent(fromText)}&toText=${encodeURIComponent(toText)}`);
    }
  };

  const isHero = variant === "hero";

  return (
    <form onSubmit={handleSearch} className={`${isHero ? "space-y-6" : "space-y-4"}`}>
      <div className={`flex flex-col ${isHero ? "md:flex-row" : "sm:flex-row"} gap-4`}>
        <div className="flex-1 relative" ref={fromDropdownRef}>
          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5 z-10" />
          {fromLoading && (
            <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4 animate-spin z-10" />
          )}
          <Input
            type="text"
            placeholder="From (e.g., Colombo Fort)"
            value={fromText}
            onChange={(e) => handleFromTextChange(e.target.value)}
            onFocus={() => fromText.length >= 2 && fromStops.length > 0 && setShowFromDropdown(true)}
            className={`pl-10 ${fromLoading ? 'pr-10' : ''} ${isHero ? "h-14 text-lg rounded-2xl" : "h-12 rounded-xl"} bg-white/95 backdrop-blur-sm shadow-elegant border-2 border-white/20 focus:border-primary/50 transition-all duration-300`}
          />
          
          {/* From Stops Dropdown */}
          {showFromDropdown && fromStops.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
              {fromStops.map((stop) => (
                <button
                  key={stop.id}
                  type="button"
                  onClick={() => selectFromStop(stop)}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none border-b border-gray-100 last:border-b-0"
                >
                  <div className="font-medium text-gray-900">{stop.name}</div>
                  {stop.city && <div className="text-sm text-gray-500">{stop.city}</div>}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className={`${isHero ? "hidden md:flex" : "hidden sm:flex"} items-center justify-center`}>
          <ArrowRight className="h-5 w-5 text-muted-foreground" />
        </div>

        <div className="flex-1 relative" ref={toDropdownRef}>
          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5 z-10" />
          {toLoading && (
            <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4 animate-spin z-10" />
          )}
          <Input
            type="text"
            placeholder="To (e.g., Kandy)"
            value={toText}
            onChange={(e) => handleToTextChange(e.target.value)}
            onFocus={() => toText.length >= 2 && toStops.length > 0 && setShowToDropdown(true)}
            className={`pl-10 ${toLoading ? 'pr-10' : ''} ${isHero ? "h-14 text-lg rounded-2xl" : "h-12 rounded-xl"} bg-white/95 backdrop-blur-sm shadow-elegant border-2 border-white/20 focus:border-primary/50 transition-all duration-300`}
          />
          
          {/* To Stops Dropdown */}
          {showToDropdown && toStops.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
              {toStops.map((stop) => (
                <button
                  key={stop.id}
                  type="button"
                  onClick={() => selectToStop(stop)}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none border-b border-gray-100 last:border-b-0"
                >
                  <div className="font-medium text-gray-900">{stop.name}</div>
                  {stop.city && <div className="text-sm text-gray-500">{stop.city}</div>}
                </button>
              ))}
            </div>
          )}
        </div>

        <Button
          type="submit"
          size={isHero ? "lg" : "default"}
          disabled={!fromStopId || !toStopId}
          className={`${isHero ? "h-14 px-10 text-lg rounded-2xl" : "h-12 px-6 rounded-xl"} bg-gradient-primary hover:shadow-glow hover:scale-105 transition-all duration-300 shadow-elegant font-semibold disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100`}
        >
          <Search className="mr-2 h-5 w-5" />
          Search Routes
        </Button>
      </div>

      {isHero && (
        <div className="flex flex-wrap gap-3 justify-center items-center">
          <span className="text-sm text-white/80 font-medium">Popular routes:</span>
          {["Colombo Fort - Kandy", "Colombo Fort - Galle", "Colombo - Negombo", "Kandy - Nuwara Eliya"].map((route) => (
            <button
              key={route}
              type="button"
              onClick={() => {
                const [fromCity, toCity] = route.split(" - ");
                handleFromTextChange(fromCity);
                handleToTextChange(toCity);
              }}
              className="px-4 py-2 text-sm bg-white/10 backdrop-blur-sm text-white rounded-full border border-white/20 hover:bg-white/20 hover:scale-105 transition-all duration-300 font-medium shadow-elegant"
            >
              {route}
            </button>
          ))}
        </div>
      )}
    </form>
  );
};

export default SearchForm;