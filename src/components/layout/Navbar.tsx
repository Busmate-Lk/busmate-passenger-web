import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Search, Menu, User, LogOut, Settings, Ticket, Heart, Wallet, Bell } from "lucide-react";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authService } from "@/lib/auth";
import profilePhoto from "@/assets/profile-photo.jpg";
import busLogo from "@/assets/bus-logo.png";
const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(authService.getCurrentUser());
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const checkAuth = () => {
      const authenticated = authService.isAuthenticated();
      setIsAuthenticated(authenticated);
      if (authenticated) {
        setUser(authService.getCurrentUser());
      } else {
        setUser(null);
      }
    };
    
    // Check on mount
    checkAuth();
    
    // Check on storage changes (for logout from another tab)
    window.addEventListener('storage', checkAuth);
    return () => window.removeEventListener('storage', checkAuth);
  }, []);

  const handleLogout = () => {
    authService.logout();
    setIsAuthenticated(false);
    setUser(null);
    navigate('/');
  };

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
            <Link to="/search" className={`transition-colors ${
              isScrolled ? 'text-foreground hover:text-primary' : 'text-white hover:text-blue-100'
            }`}>Routes</Link>
            <div className="flex items-center space-x-3">
              {isAuthenticated && user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center space-x-2 hover:opacity-80 transition-opacity focus:outline-none">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={profilePhoto} alt={user.name} />
                        <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                          {user.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <span className={`hidden sm:block transition-colors ${
                        isScrolled ? 'text-foreground' : 'text-white'
                      }`}>
                        {user.name.split(' ')[0]}
                      </span>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 bg-background border-border">
                    <DropdownMenuItem asChild>
                      <Link to="/profile" className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        View Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/my-tickets" className="flex items-center gap-2">
                        <Ticket className="h-4 w-4" />
                        My Tickets
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/favourites" className="flex items-center gap-2">
                        <Heart className="h-4 w-4" />
                        Favourites
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/wallet" className="flex items-center gap-2">
                        <Wallet className="h-4 w-4" />
                        Wallet
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/notifications" className="flex items-center gap-2">
                        <Bell className="h-4 w-4" />
                        Notifications
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/settings" className="flex items-center gap-2">
                        <Settings className="h-4 w-4" />
                        Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={handleLogout}
                      className="flex items-center gap-2 text-destructive focus:text-destructive"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <>
                  <Link to="/login">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className={`transition-all duration-300 ${
                        isScrolled 
                          ? 'text-foreground hover:bg-muted' 
                          : 'text-white hover:bg-white/10'
                      }`}
                    >
                      Login
                    </Button>
                  </Link>
                  <Link to="/signup">
                    <Button 
                      size="sm" 
                      className="bg-gradient-primary text-white hover:opacity-90 transition-opacity"
                    >
                      Sign Up
                    </Button>
                  </Link>
                </>
              )}
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
              <Link to="/search" className="text-foreground hover:text-primary transition-colors">
                Search Routes
              </Link>
              <div className="flex gap-3">
                {isAuthenticated && user ? (
                  <>
                    <Link to="/profile" className="flex items-center space-x-2 p-2 rounded-lg hover:bg-muted transition-colors">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={profilePhoto} alt={user.name} />
                        <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                          {user.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-foreground">{user.name}</span>
                    </Link>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleLogout}
                      className="border-border bg-background text-foreground hover:bg-muted transition-colors"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </Button>
                  </>
                ) : (
                  <>
                    <Link to="/login">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="border-border bg-background text-foreground hover:bg-muted transition-colors"
                      >
                        Login
                      </Button>
                    </Link>
                    <Link to="/signup">
                      <Button 
                        size="sm" 
                        className="bg-gradient-primary text-white hover:opacity-90 transition-opacity"
                      >
                        Sign Up
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>}
      </div>
    </nav>;
};
export default Navbar;