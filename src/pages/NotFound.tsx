import { Link, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { Zap, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error('404 Error:', location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full opacity-15 blur-3xl"
          style={{ background: 'hsl(262,73%,58%)' }} />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full opacity-10 blur-3xl"
          style={{ background: 'hsl(217,91%,54%)' }} />
      </div>

      <div className="relative text-center space-y-6 max-w-sm">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl overflow-hidden"
            style={{ background: 'linear-gradient(135deg, hsl(262,73%,55%), hsl(282,73%,62%))', boxShadow: '0 8px 32px -4px hsl(262 73% 55% / 0.4)' }}>
            <Zap className="h-9 w-9 text-white" fill="white" strokeWidth={0} />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 55%)' }} />
          </div>
        </div>

        {/* Number */}
        <div>
          <p className="text-8xl font-black tracking-tighter leading-none"
            style={{ background: 'linear-gradient(135deg, hsl(262,73%,55%), hsl(282,73%,62%))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            404
          </p>
          <h1 className="text-xl font-bold mt-2">Página no encontrada</h1>
          <p className="text-sm text-muted-foreground mt-1">
            La ruta <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">{location.pathname}</code> no existe.
          </p>
        </div>

        {/* CTA */}
        <Link to="/">
          <Button className="btn-primary-gradient text-white gap-2">
            <ArrowLeft className="h-4 w-4" />
            Volver al inicio
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
