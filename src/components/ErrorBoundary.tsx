import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RotateCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * Red de seguridad global: si cualquier componente lanza un error, en vez de
 * dejar al usuario con una pantalla en blanco, mostramos un aviso con un botón
 * para recargar.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // En producción esto podría enviarse a un servicio de logging.
    console.error('ErrorBoundary capturó un error:', error, info);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-6">
        <div className="max-w-sm w-full text-center">
          <div
            className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl"
            style={{ background: 'hsl(0 72% 51% / 0.12)' }}
          >
            <AlertTriangle className="h-8 w-8" style={{ color: 'hsl(0 72% 51%)' }} />
          </div>
          <h1 className="text-xl font-bold mb-2">Algo ha fallado</h1>
          <p className="text-sm text-muted-foreground mb-6">
            La aplicación ha tenido un problema inesperado. Recarga para volver a
            intentarlo. Si el problema continúa, avísanos.
          </p>
          <button
            onClick={this.handleReload}
            className="btn-primary-gradient text-white inline-flex items-center gap-2 h-11 px-6 rounded-xl font-semibold"
          >
            <RotateCw className="h-4 w-4" />
            Recargar la aplicación
          </button>
        </div>
      </div>
    );
  }
}
