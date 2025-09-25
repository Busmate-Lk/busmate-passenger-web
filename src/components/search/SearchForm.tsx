import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, MapPin, ArrowRight } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface SearchFormProps {
  variant?: "hero" | "page";
}

const SearchForm = ({ variant = "hero" }: SearchFormProps) => {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (from.trim() || to.trim()) {
      navigate(`/search?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`);
    }
  };

  const isHero = variant === "hero";

  return (
    <form onSubmit={handleSearch} className={`${isHero ? "space-y-6" : "space-y-4"}`}>
      <div className={`flex flex-col ${isHero ? "md:flex-row" : "sm:flex-row"} gap-4`}>
        <div className="flex-1 relative">
          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
          <Input
            type="text"
            placeholder="From (e.g., Colombo Fort)"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className={`pl-10 ${isHero ? "h-14 text-lg rounded-2xl" : "h-12 rounded-xl"} bg-white/95 backdrop-blur-sm shadow-elegant border-2 border-white/20 focus:border-primary/50 transition-all duration-300`}
          />
        </div>

        <div className={`${isHero ? "hidden md:flex" : "hidden sm:flex"} items-center justify-center`}>
          <ArrowRight className="h-5 w-5 text-muted-foreground" />
        </div>

        <div className="flex-1 relative">
          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
          <Input
            type="text"
            placeholder="To (e.g., Kandy)"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className={`pl-10 ${isHero ? "h-14 text-lg rounded-2xl" : "h-12 rounded-xl"} bg-white/95 backdrop-blur-sm shadow-elegant border-2 border-white/20 focus:border-primary/50 transition-all duration-300`}
          />
        </div>

        <Button
          type="submit"
          size={isHero ? "lg" : "default"}
          className={`${isHero ? "h-14 px-10 text-lg rounded-2xl" : "h-12 px-6 rounded-xl"} bg-gradient-primary hover:shadow-glow hover:scale-105 transition-all duration-300 shadow-elegant font-semibold`}
        >
          <Search className="mr-2 h-5 w-5" />
          Search Routes
        </Button>
      </div>

      {isHero && (
        <div className="flex flex-wrap gap-3 justify-center items-center">
          <span className="text-sm text-white/80 font-medium">Popular routes:</span>
          {["Colombo - Kandy", "Colombo - Galle", "Colombo - Negombo", "Kandy - Nuwara Eliya"].map((route) => (
            <button
              key={route}
              type="button"
              onClick={() => {
                const [fromCity, toCity] = route.split(" - ");
                setFrom(fromCity);
                setTo(toCity);
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