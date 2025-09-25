import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { User, Mail, Phone, Calendar, Settings, LogOut, Ticket, Heart, Wallet, Bell, Shield, MapPin, Star } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { authService, type User as UserType } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import profilePhoto from "@/assets/profile-photo.jpg";
import Navbar from "@/components/layout/Navbar";
const ProfilePage = () => {
  const [user, setUser] = useState<UserType | null>(null);
  const navigate = useNavigate();
  const {
    toast
  } = useToast();
  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      navigate('/login');
      return;
    }
    setUser(currentUser);
  }, [navigate]);
  const handleLogout = () => {
    authService.logout();
    toast({
      title: "Logged out successfully",
      description: "See you next time!"
    });
    navigate('/');
  };
  if (!user) {
    return null;
  }
  const profileMenuItems = [{
    icon: Ticket,
    title: "My Tickets",
    description: "View and manage your bus tickets",
    href: "/my-tickets",
    badge: "3 Active"
  }, {
    icon: Heart,
    title: "Favourites",
    description: "Your saved routes and destinations",
    href: "/favourites",
    badge: "5 Routes"
  }, {
    icon: Wallet,
    title: "Wallet",
    description: "Manage payments and refunds",
    href: "/wallet",
    badge: "$125.50"
  }, {
    icon: Bell,
    title: "Notifications",
    description: "Trip updates and announcements",
    href: "/notifications",
    badge: "2 New"
  }];
  const quickStats = [{
    label: "Trips Completed",
    value: "47"
  }, {
    label: "Total Distance",
    value: "2,340 km"
  }, {
    label: "CO₂ Saved",
    value: "142 kg"
  }, {
    label: "Member Since",
    value: new Date(user.joinedDate).getFullYear().toString()
  }];
  return <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Header */}
      <div className="bg-gradient-primary text-white pt-20">
        <div className="container mx-auto px-4 py-8">
          
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <Avatar className="h-24 w-24 border-4 border-white/20 shadow-soft">
              <AvatarImage src={profilePhoto} alt={user.name} className="object-cover " />
              <AvatarFallback className="bg-white/10 text-white text-xl">
                {user.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold mb-2">{user.name}</h1>
                  <div className="flex items-center gap-4 text-white/80">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      <span>{user.email}</span>
                    </div>
                    {user.phone && <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        <span>{user.phone}</span>
                      </div>}
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <Calendar className="h-4 w-4" />
                    <span className="text-white/80">
                      Member since {new Date(user.joinedDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long'
                    })}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Badge variant="secondary" className="bg-white/10 text-white border-white/20">
                    <Star className="h-3 w-3 mr-1" />
                    Premium Member
                  </Badge>
                  <Button variant="outline" size="sm" className="border-white/20 text-white hover:text-white bg-[#cbcbcb]/25">
                    <Settings className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Your Journey Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {quickStats.map((stat, index) => <div key={index} className="text-center p-4 rounded-lg bg-muted/50">
                      <div className="text-2xl font-bold text-primary mb-1">{stat.value}</div>
                      <div className="text-sm text-muted-foreground">{stat.label}</div>
                    </div>)}
                </div>
              </CardContent>
            </Card>

            {/* Profile Menu */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Access</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {profileMenuItems.map((item, index) => <div key={index}>
                    <Link to={item.href} className="flex items-center justify-between p-4 rounded-lg hover:bg-muted/50 transition-colors group">
                      <div className="flex items-center gap-4">
                        <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                          <item.icon className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-medium group-hover:text-primary transition-colors">
                            {item.title}
                          </h3>
                          <p className="text-sm text-muted-foreground">{item.description}</p>
                        </div>
                      </div>
                      <Badge variant="secondary" className="bg-accent/10 text-accent">
                        {item.badge}
                      </Badge>
                    </Link>
                    {index < profileMenuItems.length - 1 && <Separator className="my-2" />}
                  </div>)}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Account Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Account Security
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Email Verified</span>
                  <Badge className="bg-secondary text-secondary-foreground">
                    ✓ Verified
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Phone Verified</span>
                  <Badge className="bg-secondary text-secondary-foreground">
                    ✓ Verified
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Two-Factor Auth</span>
                  <Badge variant="outline">Setup</Badge>
                </div>
                <Separator />
                <Button variant="outline" className="w-full">
                  <Settings className="h-4 w-4 mr-2" />
                  Security Settings
                </Button>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="p-1 rounded-full bg-primary/10">
                    <Ticket className="h-3 w-3 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm">Booked ticket to Boston</p>
                    <p className="text-xs text-muted-foreground">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-1 rounded-full bg-accent/10">
                    <Heart className="h-3 w-3 text-accent" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm">Added route to favorites</p>
                    <p className="text-xs text-muted-foreground">1 day ago</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-1 rounded-full bg-secondary/10">
                    <MapPin className="h-3 w-3 text-secondary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm">Completed trip to NYC</p>
                    <p className="text-xs text-muted-foreground">3 days ago</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Logout */}
            <Card>
              <CardContent className="pt-6">
                <Button variant="destructive" className="w-full" onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>;
};
export default ProfilePage;