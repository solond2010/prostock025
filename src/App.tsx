import { lazy, Suspense, ReactNode, ComponentType } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { PWAUpdatePrompt } from "./components/PWAUpdatePrompt";
import { OfflineBanner } from "./components/OfflineBanner";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { MainLayout } from "./components/layout/MainLayout";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";

// Cada página se carga solo cuando se entra en su ruta (code-splitting).
// Esto reduce el bundle inicial de ~1,6 MB a unos cientos de KB.
//
// lazyWithRetry: si falla la carga de un chunk (típico cuando hay un deploy
// nuevo y la pestaña abierta tiene los nombres de chunk viejos), recargamos la
// página UNA vez para coger la versión nueva, en vez de mostrar el error.
function lazyWithRetry<T extends ComponentType<any>>(factory: () => Promise<{ default: T }>) {
  return lazy(async () => {
    try {
      return await factory();
    } catch (err) {
      const KEY = 'chunk-reload-ts';
      const last = Number(sessionStorage.getItem(KEY) || 0);
      if (Date.now() - last > 10000) {
        sessionStorage.setItem(KEY, String(Date.now()));
        window.location.reload();
        return await new Promise<{ default: T }>(() => {}); // se recarga la página
      }
      throw err;
    }
  });
}

const Index = lazyWithRetry(() => import("./pages/Index"));
const MonthlyCharts = lazyWithRetry(() => import("./pages/MonthlyCharts"));
const GastoMaterial = lazyWithRetry(() => import("./pages/GastoMaterial"));
const EstadisticasAvanzadas = lazyWithRetry(() => import("./pages/EstadisticasAvanzadas"));
const FinanzasPersonales = lazyWithRetry(() => import("./pages/FinanzasPersonales"));
const Auth = lazyWithRetry(() => import("./pages/Auth"));
const ResetPassword = lazyWithRetry(() => import("./pages/ResetPassword"));
const RegistroAdmin = lazyWithRetry(() => import("./pages/RegistroAdmin"));
const InventarioPiezas = lazyWithRetry(() => import("./pages/InventarioPiezas"));
const OfertasLive = lazyWithRetry(() => import("./pages/OfertasLive"));
const Tareas = lazyWithRetry(() => import("./pages/Tareas"));
const Agenda = lazyWithRetry(() => import("./pages/Agenda"));
const Dashboard = lazyWithRetry(() => import("./pages/Dashboard"));
const BotControl = lazyWithRetry(() => import("./pages/BotControl"));
const Pipeline = lazyWithRetry(() => import("./pages/Pipeline"));
const MisBusquedas = lazyWithRetry(() => import("./pages/MisBusquedas"));
const Calculadora = lazyWithRetry(() => import("./pages/Calculadora"));
const MensajesBot = lazyWithRetry(() => import("./pages/MensajesBot"));
const Admin = lazyWithRetry(() => import("./pages/Admin"));
const NotFound = lazyWithRetry(() => import("./pages/NotFound"));

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
        <OfflineBanner />
        <PWAUpdatePrompt />
        <BrowserRouter>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route path="/reset-password" element={<ResetPassword />} />
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
              <Route path="/mensajes-bot" element={<Protected><MensajesBot /></Protected>} />
              <Route path="/pipeline" element={<Protected><Pipeline /></Protected>} />
              <Route path="/mis-busquedas" element={<Protected><MisBusquedas /></Protected>} />
              <Route path="/calculadora" element={<Protected><Calculadora /></Protected>} />
              <Route path="/admin" element={<Protected><Admin /></Protected>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
