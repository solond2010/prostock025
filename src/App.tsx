import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MainLayout } from "./components/layout/MainLayout";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import Index from "./pages/Index";
import MonthlyCharts from "./pages/MonthlyCharts";
import GastoMaterial from "./pages/GastoMaterial";
import EstadisticasAvanzadas from "./pages/EstadisticasAvanzadas";
import Auth from "./pages/Auth";
import RegistroAdmin from "./pages/RegistroAdmin";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route path="/registro-admin-secreto" element={<RegistroAdmin />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Index />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/graficos"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <MonthlyCharts />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/gasto-material"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <GastoMaterial />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/estadisticas"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <EstadisticasAvanzadas />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
