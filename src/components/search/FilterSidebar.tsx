import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  Clock, 
  Star, 
  Bus, 
  Wifi, 
  AirVent, 
  Armchair, 
  Monitor,
  X,
  SlidersHorizontal
} from "lucide-react";

interface FilterState {
  routeTypes: string[];
  operators: string[];
  amenities: string[];
  priceRange: [number, number];
  rating: number;
  timeSlots: string[];
  sortBy: string;
}

interface FilterSidebarProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  isOpen: boolean;
  onToggle: () => void;
}

const routeTypes = [
  { id: "Express", label: "Express", color: "bg-blue-500" },
  { id: "Luxury", label: "Luxury", color: "bg-purple-500" },
  { id: "Semi-Express", label: "Semi-Express", color: "bg-green-500" },
  { id: "Regular", label: "Regular", color: "bg-gray-500" }
];

const operators = [
  { id: "SLTB", label: "SLTB" },
  { id: "Private", label: "Private" }
];

const amenities = [
  { id: "AC", label: "Air Conditioning", icon: AirVent },
  { id: "WiFi", label: "WiFi", icon: Wifi },
  { id: "Comfortable Seats", label: "Comfortable Seats", icon: Armchair },
  { id: "Reclining Seats", label: "Reclining Seats", icon: Armchair },
  { id: "Entertainment", label: "Entertainment", icon: Monitor }
];

const timeSlots = [
  { id: "early-morning", label: "Early Morning (5AM - 8AM)", time: "5AM-8AM" },
  { id: "morning", label: "Morning (8AM - 12PM)", time: "8AM-12PM" },
  { id: "afternoon", label: "Afternoon (12PM - 5PM)", time: "12PM-5PM" },
  { id: "evening", label: "Evening (5PM - 8PM)", time: "5PM-8PM" },
  { id: "night", label: "Night (8PM - 11PM)", time: "8PM-11PM" }
];

const sortOptions = [
  { id: "departure", label: "Departure Time" },
  { id: "price-low", label: "Price: Low to High" },
  { id: "price-high", label: "Price: High to Low" },
  { id: "duration", label: "Duration" },
  { id: "rating", label: "Rating" }
];

const FilterSidebar = ({ filters, onFiltersChange, isOpen, onToggle }: FilterSidebarProps) => {
  const updateFilter = (key: keyof FilterState, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const toggleArrayFilter = (key: 'routeTypes' | 'operators' | 'amenities' | 'timeSlots', value: string) => {
    const currentArray = filters[key];
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value];
    updateFilter(key, newArray);
  };

  const clearAllFilters = () => {
    onFiltersChange({
      routeTypes: [],
      operators: [],
      amenities: [],
      priceRange: [0, 500],
      rating: 0,
      timeSlots: [],
      sortBy: "departure"
    });
  };

  const activeFiltersCount = 
    filters.routeTypes.length + 
    filters.operators.length + 
    filters.amenities.length + 
    filters.timeSlots.length + 
    (filters.rating > 0 ? 1 : 0) +
    (filters.priceRange[0] > 0 || filters.priceRange[1] < 500 ? 1 : 0);

  return (
    <>
      {/* Mobile Filter Toggle */}
      <div className="lg:hidden mb-4">
        <Button
          variant="outline"
          onClick={onToggle}
          className="w-full justify-start gap-2"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="ml-auto">
              {activeFiltersCount}
            </Badge>
          )}
        </Button>
      </div>

      {/* Filter Sidebar */}
      <div className={`
        fixed lg:relative top-0 left-0 h-full lg:h-auto
        w-80 lg:w-full bg-background lg:bg-transparent
        border-r lg:border-r-0 z-50 transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        overflow-y-auto
      `}>
        <Card className="h-full lg:h-auto border-0 lg:border rounded-none lg:rounded-lg">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold">
                Filters
                {activeFiltersCount > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {activeFiltersCount}
                  </Badge>
                )}
              </CardTitle>
              <div className="flex items-center gap-2">
                {activeFiltersCount > 0 && (
                  <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                    Clear All
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onToggle}
                  className="lg:hidden"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-1">
            <Accordion type="multiple" defaultValue={["route-type", "time", "price"]} className="w-full">
              
              {/* Sort By */}
              <AccordionItem value="sort">
                <AccordionTrigger className="text-sm font-medium">
                  Sort By
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2">
                    {sortOptions.map((option) => (
                      <div key={option.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`sort-${option.id}`}
                          checked={filters.sortBy === option.id}
                          onCheckedChange={() => updateFilter('sortBy', option.id)}
                        />
                        <label
                          htmlFor={`sort-${option.id}`}
                          className="text-sm cursor-pointer"
                        >
                          {option.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Route Type */}
              <AccordionItem value="route-type">
                <AccordionTrigger className="text-sm font-medium">
                  <div className="flex items-center gap-2">
                    <Bus className="h-4 w-4" />
                    Route Type
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3">
                    {routeTypes.map((type) => (
                      <div key={type.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`route-${type.id}`}
                          checked={filters.routeTypes.includes(type.id)}
                          onCheckedChange={() => toggleArrayFilter('routeTypes', type.id)}
                        />
                        <label
                          htmlFor={`route-${type.id}`}
                          className="text-sm cursor-pointer flex items-center gap-2"
                        >
                          <div className={`w-2 h-2 rounded-full ${type.color}`} />
                          {type.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Departure Time */}
              <AccordionItem value="time">
                <AccordionTrigger className="text-sm font-medium">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Departure Time
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3">
                    {timeSlots.map((slot) => (
                      <div key={slot.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`time-${slot.id}`}
                          checked={filters.timeSlots.includes(slot.id)}
                          onCheckedChange={() => toggleArrayFilter('timeSlots', slot.id)}
                        />
                        <label
                          htmlFor={`time-${slot.id}`}
                          className="text-sm cursor-pointer"
                        >
                          <div>{slot.label.split(' (')[0]}</div>
                          <div className="text-xs text-muted-foreground">
                            {slot.time}
                          </div>
                        </label>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Price Range */}
              <AccordionItem value="price">
                <AccordionTrigger className="text-sm font-medium">
                  Price Range
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4">
                    <Slider
                      value={filters.priceRange}
                      onValueChange={(value) => updateFilter('priceRange', value as [number, number])}
                      max={500}
                      min={0}
                      step={20}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Rs. {filters.priceRange[0]}</span>
                      <span>Rs. {filters.priceRange[1]}</span>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Rating */}
              <AccordionItem value="rating">
                <AccordionTrigger className="text-sm font-medium">
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4" />
                    Minimum Rating
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3">
                    {[4.5, 4.0, 3.5, 3.0].map((rating) => (
                      <div key={rating} className="flex items-center space-x-2">
                        <Checkbox
                          id={`rating-${rating}`}
                          checked={filters.rating === rating}
                          onCheckedChange={() => updateFilter('rating', filters.rating === rating ? 0 : rating)}
                        />
                        <label
                          htmlFor={`rating-${rating}`}
                          className="text-sm cursor-pointer flex items-center gap-1"
                        >
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span>{rating} & above</span>
                        </label>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Operators */}
              <AccordionItem value="operators">
                <AccordionTrigger className="text-sm font-medium">
                  Bus Operators
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3">
                    {operators.map((operator) => (
                      <div key={operator.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`operator-${operator.id}`}
                          checked={filters.operators.includes(operator.id)}
                          onCheckedChange={() => toggleArrayFilter('operators', operator.id)}
                        />
                        <label
                          htmlFor={`operator-${operator.id}`}
                          className="text-sm cursor-pointer"
                        >
                          {operator.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Amenities */}
              <AccordionItem value="amenities">
                <AccordionTrigger className="text-sm font-medium">
                  Amenities
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3">
                    {amenities.map((amenity) => {
                      const Icon = amenity.icon;
                      return (
                        <div key={amenity.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`amenity-${amenity.id}`}
                            checked={filters.amenities.includes(amenity.id)}
                            onCheckedChange={() => toggleArrayFilter('amenities', amenity.id)}
                          />
                          <label
                            htmlFor={`amenity-${amenity.id}`}
                            className="text-sm cursor-pointer flex items-center gap-2"
                          >
                            <Icon className="h-4 w-4" />
                            {amenity.label}
                          </label>
                        </div>
                      );
                    })}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
      </div>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}
    </>
  );
};

export default FilterSidebar;