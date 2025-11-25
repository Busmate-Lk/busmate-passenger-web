import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import busLogo from "@/assets/bus-logo.png";
import { useAsgardeo, UserDropdown } from '@asgardeo/react';


const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Use Asgardeo SDK directly for login/logout buttons
  const { signIn } = useAsgardeo();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogin = () => {
    signIn();
  };

  return <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
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
          <span className={`text-2xl font-bold transition-colors ${isScrolled ? 'text-foreground' : 'text-white'
            }`}>BusMate</span>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-6">
          <Link to="/" className={`transition-colors ${isScrolled ? 'text-foreground hover:text-primary' : 'text-white hover:text-blue-100'
            }`}>Home</Link>
          <Link to="/search" className={`transition-colors ${isScrolled ? 'text-foreground hover:text-primary' : 'text-white hover:text-blue-100'
            }`}>Routes</Link>
          <div className="flex items-center space-x-3 relative">
            <div className="relative inline-block">
              <UserDropdown
                menuItems={[
                  { label: 'Profile', href: '/profile' },
                  { label: 'My Bookings', href: '/profile?tab=bookings' },
                  { label: 'Settings', href: '/settings' },
                ]}
                showTriggerLabel={false}
                avatarSize={40}
                onSignOut={() => {
                  // Optional: Add any custom sign-out logic here
                  console.log('User signed out');
                }}
                fallback={
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleLogin}
                      className={`transition-all duration-300 ${isScrolled
                        ? 'text-foreground hover:bg-muted'
                        : 'text-white hover:bg-white/10'
                        }`}
                    >
                      Login
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleLogin}
                      className="bg-gradient-primary text-white hover:opacity-90 transition-opacity"
                    >
                      Sign Up
                    </Button>
                  </>
                }
                className={`user-dropdown ${isScrolled ? 'scrolled' : 'transparent'}`}
              />
            </div>
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
          <Link to="/" className="text-foreground hover:text-primary transition-colors" onClick={() => setIsMenuOpen(false)}>
            Home
          </Link>
          <Link to="/search" className="text-foreground hover:text-primary transition-colors" onClick={() => setIsMenuOpen(false)}>
            Search Routes
          </Link>
          <div className="flex justify-center relative">
            <div className="relative inline-block">
              <UserDropdown
                menuItems={[
                  { label: 'Profile', href: '/profile' },
                  { label: 'My Bookings', href: '/profile?tab=bookings' },
                  { label: 'Settings', href: '/settings' },
                ]}
                showTriggerLabel={true}
                avatarSize={32}
                onSignOut={() => {
                  setIsMenuOpen(false);
                  console.log('User signed out');
                }}
                fallback={
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        handleLogin();
                        setIsMenuOpen(false);
                      }}
                      className="border-border bg-background text-foreground hover:bg-muted transition-colors"
                    >
                      Login
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => {
                        handleLogin();
                        setIsMenuOpen(false);
                      }}
                      className="bg-gradient-primary text-white hover:opacity-90 transition-opacity"
                    >
                      Sign Up
                    </Button>
                  </div>
                }
                className="mobile-user-dropdown"
              />
            </div>
          </div>
        </div>
      </div>}
    </div>
  </nav>;
};
export default Navbar;