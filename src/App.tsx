import React, { Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { DomainsProvider } from "@/contexts/DomainsContext";
import { Skeleton } from "@/components/ui/skeleton";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ServiceLog from "./pages/ServiceLog";
import UserManagement from "./pages/UserManagement";
import AdminConsole from "./pages/AdminConsole";
import NotFound from "./pages/NotFound";

// Lazy load Verification page (heavy component)
const Verification = React.lazy(() => import("./pages/Verification"));

// Loading fallback for lazy-loaded pages
const PageLoader = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <div className="flex gap-2">
        <Skeleton
          className="h-3 w-3 rounded-full animate-bounce"
          style={{ animationDelay: "0ms" }}
        />
        <Skeleton
          className="h-3 w-3 rounded-full animate-bounce"
          style={{ animationDelay: "150ms" }}
        />
        <Skeleton
          className="h-3 w-3 rounded-full animate-bounce"
          style={{ animationDelay: "300ms" }}
        />
      </div>
      <span className="text-muted-foreground text-sm">Memuat halaman...</span>
    </div>
  </div>
);

const queryClient = new QueryClient();

// These components must be inside AuthProvider
const ProtectedRoute: React.FC<{
  children: React.ReactNode;
  adminOnly?: boolean;
}> = ({ children, adminOnly = false }) => {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

const AuthRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route
        path="/login"
        element={
          <AuthRoute>
            <Login />
          </AuthRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/verification"
        element={
          <ProtectedRoute>
            <Suspense fallback={<PageLoader />}>
              <Verification />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/service-log"
        element={
          <ProtectedRoute>
            <ServiceLog />
          </ProtectedRoute>
        }
      />
      <Route
        path="/users"
        element={
          <ProtectedRoute adminOnly>
            <UserManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin-console"
        element={
          <ProtectedRoute adminOnly>
            <AdminConsole />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <DomainsProvider>
            <AppRoutes />
          </DomainsProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
