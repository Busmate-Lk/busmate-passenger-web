import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import busLogo from "@/assets/bus-logo.png";

const SignupPage = () => {
  const { signIn, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleSignup = async () => {
    try {
      await signIn(); // Asgardeo handles both login and signup flows
    } catch (error) {
      console.error('Signup failed:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-primary flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-2">
            <div className="p-2 rounded-lg bg-gradient-primary">
              <img src={busLogo} alt="BusMate" className="h-8 w-8 object-contain filter brightness-0 invert" />
            </div>
            <span className="text-2xl font-bold text-foreground">BusMate</span>
          </div>
          <CardTitle className="text-2xl">Join BusMate</CardTitle>
          <p className="text-muted-foreground">
            Create your account and start your bus travel journey
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={handleSignup}
            className="w-full bg-gradient-primary text-white hover:opacity-90 transition-opacity"
            disabled={isLoading}
          >
            {isLoading ? "Creating account..." : "Sign Up with Asgardeo"}
          </Button>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Button variant="link" className="p-0 h-auto" onClick={() => navigate('/login')}>
                Sign in
              </Button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignupPage;