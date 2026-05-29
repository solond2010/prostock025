import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Zap } from 'lucide-react';
import { z } from 'zod';

const authSchema = z.object({
  email: z.string().email({ message: 'Email inválido' }),
  password: z.string().min(6, { message: 'La contraseña debe tener al menos 6 caracteres' }),
});

export default function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const [mode, setMode] = useState<'login' | 'reset'>('login');
  const { signIn, resetPassword, user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleResetRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    const emailCheck = z.string().email().safeParse(email);
    if (!emailCheck.success) {
      setErrors({ email: 'Introduce un email válido' });
      return;
    }
    setIsLoading(true);
    const { error } = await resetPassword(email);
    setIsLoading(false);
    if (error) {
      toast({ title: 'Error', description: 'No se pudo enviar el email. Inténtalo de nuevo.', variant: 'destructive' });
    } else {
      toast({
        title: '📧 Email enviado',
        description: 'Revisa tu correo para restablecer la contraseña.',
        duration: 6000,
      });
      setMode('login');
    }
  };

  useEffect(() => {
    if (!loading && user) navigate('/');
  }, [user, loading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = authSchema.safeParse({ email, password });
    if (!result.success) {
      const fieldErrors: { email?: string; password?: string } = {};
      result.error.errors.forEach((err) => {
        if (err.path[0] === 'email') fieldErrors.email = err.message;
        if (err.path[0] === 'password') fieldErrors.password = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setIsLoading(true);
    const { error } = await signIn(email, password);

    if (error) {
      let message = 'Error al iniciar sesión';
      if (error.message.includes('Invalid login credentials')) message = 'Credenciales incorrectas';
      else if (error.message.includes('Email not confirmed')) message = 'Email no confirmado';
      toast({ title: 'Error', description: message, variant: 'destructive' });
    } else {
      toast({ title: 'Bienvenido de nuevo' });
      navigate('/');
    }
    setIsLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Background decorative blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full opacity-20 blur-3xl"
          style={{ background: 'hsl(262,73%,58%)' }} />
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full opacity-15 blur-3xl"
          style={{ background: 'hsl(282,73%,62%)' }} />
      </div>

      <div className="relative w-full max-w-[380px]">
        {/* Card */}
        <div className="rounded-2xl border border-border/60 bg-card/95 backdrop-blur-sm shadow-xl p-8">

          {/* Brand */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl overflow-hidden mb-4"
              style={{ background: 'linear-gradient(135deg, hsl(262,73%,55%), hsl(282,73%,62%))' }}>
              <Zap className="h-7 w-7 text-white" fill="white" strokeWidth={0} />
              <div className="absolute inset-0 rounded-2xl"
                style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 55%)' }} />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Flipr</h1>
            <p className="text-sm text-muted-foreground mt-1">Tu panel de compra-venta</p>
          </div>

          {/* Form */}
          <form onSubmit={mode === 'login' ? handleSubmit : handleResetRequest} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-medium">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                className="h-11 rounded-xl border-border/60 focus-visible:ring-primary/30"
                autoComplete="email"
              />
              {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
            </div>

            {mode === 'login' && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-sm font-medium">Contraseña</Label>
                  <button
                    type="button"
                    onClick={() => { setMode('reset'); setErrors({}); }}
                    className="text-xs text-primary hover:underline font-medium"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className="h-11 rounded-xl border-border/60 focus-visible:ring-primary/30"
                  autoComplete="current-password"
                />
                {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
              </div>
            )}

            {mode === 'reset' && (
              <p className="text-xs text-muted-foreground -mt-1">
                Te enviaremos un enlace a tu email para crear una contraseña nueva.
              </p>
            )}

            <Button
              type="submit"
              className="w-full h-11 rounded-xl font-semibold text-sm mt-2"
              style={{ background: 'linear-gradient(135deg, hsl(262,73%,55%), hsl(282,73%,62%))' }}
              disabled={isLoading}
            >
              {isLoading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{mode === 'login' ? 'Iniciando sesión...' : 'Enviando...'}</>
              ) : (
                mode === 'login' ? 'Entrar' : 'Enviar enlace de recuperación'
              )}
            </Button>

            {mode === 'reset' && (
              <button
                type="button"
                onClick={() => { setMode('login'); setErrors({}); }}
                className="w-full text-center text-xs text-muted-foreground hover:text-foreground"
              >
                ← Volver al inicio de sesión
              </button>
            )}
          </form>
        </div>

        <p className="text-center text-xs text-muted-foreground/50 mt-6">
          Flipr · Panel privado
        </p>
      </div>
    </div>
  );
}
