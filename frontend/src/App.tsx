import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ThemeProvider } from "@/components/theme-provider";
import { useIsMobile } from "@/hooks/use-mobile";
import LoginPage from "@/pages/Login";

import { useState, useEffect } from "react";
import ActivePage from "./components/active-page";

function App() {
  const [section, setSection] = useState("Home");
  const isMobile = useIsMobile();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already authenticated
    const token = localStorage.getItem("auth-token");
    if (token) {
      // Optionally validate token with your backend
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      {isAuthenticated ? (
        <SidebarProvider>
          <AppSidebar setSection={setSection} />
          {isMobile && <SidebarTrigger />}
          <SidebarInset>
            <ActivePage section={section} />
          </SidebarInset>
        </SidebarProvider>
      ) : (
        <LoginPage onLoginSuccess={handleLoginSuccess} />
      )}
    </ThemeProvider>
  );
}

export default App;