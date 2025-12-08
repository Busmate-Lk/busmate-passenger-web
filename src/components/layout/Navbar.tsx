// Navbar for public site — no auth buttons
import { Menu } from "lucide-react";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import busLogo from "@/assets/bus-logo.png";
const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // No auth checks for the public site — simplified nav

  // No logout / auth functions required

  return <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
    isScrolled 
      ? 'bg-white/95 backdrop-blur-sm border-b border-border shadow-card' 
      : 'bg-transparent'
  }`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-lg bg-gradient-primary">
              <img src={busLogo} alt="BusMate" className="h-8 w-8 object-contain filter brightness-0 invert" />
            </div>
            <span className={`text-2xl font-bold transition-colors ${
              isScrolled ? 'text-foreground' : 'text-white'
            }`}>BusMate</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/" className={`transition-colors ${
              isScrolled ? 'text-foreground hover:text-primary' : 'text-white hover:text-blue-100'
            }`}>Home</Link>
            <Link to="/findmybus" className={`transition-colors ${
              isScrolled ? 'text-foreground hover:text-primary' : 'text-white hover:text-blue-100'
            }`}>Routes</Link>
            {/* Public site: no auth UI */}
            <div className="flex items-center space-x-3">
              {/* Add any public CTAs here if needed later */}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            <Menu className="h-6 w-6" />
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && <div className="md:hidden py-4 border-t border-border bg-white/95 backdrop-blur-sm">
            <div className="flex flex-col space-y-4">
              <Link to="/" className="text-foreground hover:text-primary transition-colors">
                Home
              </Link>
              <Link to="/findmybus" className="text-foreground hover:text-primary transition-colors">
                Search Routes
              </Link>
              {/* No auth buttons in mobile menu - public site */}
              <div className="flex gap-3" />
            </div>
          </div>}
      </div>
    </nav>;
};
export default Navbar;