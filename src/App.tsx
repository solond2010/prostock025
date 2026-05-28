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
import FinanzasPersonales from "./pages/FinanzasPersonales";
import Auth from "./pages/Auth";
import RegistroAdmin from "./pages/RegistroAdmin";
import InventarioPiezas from "./pages/InventarioPiezas";
import OfertasLive from "./pages/OfertasLive";
import Tareas from "./pages/Tareas";
import Agenda from "./pages/Agenda";
import Dashboard from "./pages/Dashboard";
import BotControl from "./pages/BotControl";
import Pipeline from "./pages/Pipeline";
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
          <Route
            path="/finanzas-personales"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <FinanzasPersonales />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/inventario-piezas"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <InventarioPiezas />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/ofertas"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <OfertasLive />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/tareas"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Tareas />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/agenda"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Agenda />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Dashboard />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/bot"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <BotControl />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/pipeline"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Pipeline />
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
