import { lazy, Suspense, ReactNode } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { PWAUpdatePrompt } from "./components/PWAUpdatePrompt";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { MainLayout } from "./components/layout/MainLayout";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";

// Cada página se carga solo cuando se entra en su ruta (code-splitting).
// Esto reduce el bundle inicial de ~1,6 MB a unos cientos de KB.
const Index = lazy(() => import("./pages/Index"));
const MonthlyCharts = lazy(() => import("./pages/MonthlyCharts"));
const GastoMaterial = lazy(() => import("./pages/GastoMaterial"));
const EstadisticasAvanzadas = lazy(() => import("./pages/EstadisticasAvanzadas"));
const FinanzasPersonales = lazy(() => import("./pages/FinanzasPersonales"));
const Auth = lazy(() => import("./pages/Auth"));
const RegistroAdmin = lazy(() => import("./pages/RegistroAdmin"));
const InventarioPiezas = lazy(() => import("./pages/InventarioPiezas"));
const OfertasLive = lazy(() => import("./pages/OfertasLive"));
const Tareas = lazy(() => import("./pages/Tareas"));
const Agenda = lazy(() => import("./pages/Agenda"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const BotControl = lazy(() => import("./pages/BotControl"));
const Pipeline = lazy(() => import("./pages/Pipeline"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}

// Atajo: ruta protegida + layout, para no repetir el wrapper en cada <Route>.
function Protected({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute>
      <MainLayout>{children}</MainLayout>
    </ProtectedRoute>
  );
}

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <PWAUpdatePrompt />
        <BrowserRouter>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route path="/registro-admin-secreto" element={<RegistroAdmin />} />
              <Route path="/" element={<Protected><Index /></Protected>} />
              <Route path="/graficos" element={<Protected><MonthlyCharts /></Protected>} />
              <Route path="/gasto-material" element={<Protected><GastoMaterial /></Protected>} />
              <Route path="/estadisticas" element={<Protected><EstadisticasAvanzadas /></Protected>} />
              <Route path="/finanzas-personales" element={<Protected><FinanzasPersonales /></Protected>} />
              <Route path="/inventario-piezas" element={<Protected><InventarioPiezas /></Protected>} />
              <Route path="/ofertas" element={<Protected><OfertasLive /></Protected>} />
              <Route path="/tareas" element={<Protected><Tareas /></Protected>} />
              <Route path="/agenda" element={<Protected><Agenda /></Protected>} />
              <Route path="/dashboard" element={<Protected><Dashboard /></Protected>} />
              <Route path="/bot" element={<Protected><BotControl /></Protected>} />
              <Route path="/pipeline" element={<Protected><Pipeline /></Protected>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
