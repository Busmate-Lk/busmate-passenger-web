import { createRoot } from "react-dom/client";
import { AsgardeoProvider } from '@asgardeo/react'
import { AuthProvider } from "./contexts/AuthContext";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(
    <AsgardeoProvider
      clientId="uugkfsXAsFzkzaALcRk4D2vnnwsa"
      baseUrl="https://api.asgardeo.io/t/busmate"
    >
        <AuthProvider>
            <App />
        </AuthProvider>
    </AsgardeoProvider>
);
