import { AsgardeoProvider } from "@asgardeo/react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import FindMyBusPage from "./pages/FindMyBusPage";
import FindMyBusDetailPage from "./pages/FindMyBusDetailPage";
import TripDetails from "./pages/TripDetails";
import NotFoundPage from "./pages/NotFoundPage";

const queryClient = new QueryClient();

const App = () => (
  <AsgardeoProvider
    baseUrl={import.meta.env.VITE_ASGARDEO_BASE_URL || ""}
    clientId={import.meta.env.VITE_ASGARDEO_CLIENT_ID || ""}
    // afterSignInUrl={import.meta.env.VITE_ASGARDEO_SIGN_IN_REDIRECT_URL || window.location.origin}
    // afterSignOutUrl={import.meta.env.VITE_ASGARDEO_SIGN_OUT_REDIRECT_URL || window.location.origin}
    scopes="openid profile email"
  >
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/findmybus" element={<FindMyBusPage />} />
            <Route path="/findmybus/detail" element={<FindMyBusDetailPage />} />
            <Route path="/trip/:tripId" element={<TripDetails />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </AsgardeoProvider>
);

export default App;
