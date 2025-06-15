import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import Dashboard from "@/pages/dashboard";
import ProjectDetail from "@/pages/project-detail";
import UITemplate from "@/pages/ui-template";
import { ProtectedRoute } from "./lib/protected-route";
import { AuthProvider } from "./hooks/use-auth";
import { ThemeProvider } from "next-themes";

function Router() {
  return (
    <Switch>
      {/* Non-protected routes */}
      <Route path="/auth" component={AuthPage} />
      <Route path="/ui-template" component={UITemplate} />
      
      {/* Protected routes */}
      <ProtectedRoute path="/" component={Dashboard} />
      <ProtectedRoute path="/projects/:id" component={ProjectDetail} />
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class">
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
