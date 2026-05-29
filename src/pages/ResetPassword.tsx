import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Zap, KeyRound } from 'lucide-react';
import { z } from 'zod';

const schema = z.object({
  password: z.string().min(6, { message: 'Mínimo 6 caracteres' }),
  confirm: z.string(),
}).refine((d) => d.password === d.confirm, {
  message: 'Las contraseñas no coinciden',
  path: ['confirm'],
});

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ password?: string; confirm?: string }>({});
  const [done, setDone] = useState(false);

  const { updatePassword } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Al llegar desde el enlace del email, Supabase deja una sesión de recuperación.
  // No redirigimos por estar "logueado": aquí justamente se cambia la contraseña.

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    const result = schema.safeParse({ password, confirm });
    if (!result.success) {
      const fe: { password?: string; confirm?: string } = {};
      result.error.errors.forEach((err) => {
        const p = err.path[0] as 'password' | 'confirm';
        fe[p] = err.message;
      });
      setErrors(fe);
      return;
    }

    setIsLoading(true);
    const { error } = await updatePassword(password);
    setIsLoading(false);

    if (error) {
      const msg = error.message.includes('session')
        ? 'El enlace ha caducado. Solicita uno nuevo desde "¿Olvidaste tu contraseña?".'
        : 'No se pudo actualizar la contraseña. Inténtalo de nuevo.';
      toast({ title: 'Error', description: msg, variant: 'destructive', duration: 6000 });
    } else {
      setDone(true);
      toast({ title: '✅ Contraseña actualizada', description: 'Ya puedes usar tu nueva contraseña.' });
      setTimeout(() => navigate('/'), 1500);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full opacity-20 blur-3xl" style={{ background: 'hsl(262,73%,58%)' }} />
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full opacity-15 blur-3xl" style={{ background: 'hsl(282,73%,62%)' }} />
      </div>

      <div className="relative w-full max-w-[380px]">
        <div className="rounded-2xl border border-border/60 bg-card/95 backdrop-blur-sm shadow-xl p-8">
          <div className="flex flex-col items-center mb-8">
            <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl overflow-hidden mb-4"
              style={{ background: 'linear-gradient(135deg, hsl(262,73%,55%), hsl(282,73%,62%))' }}>
              <KeyRound className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">Nueva contraseña</h1>
            <p className="text-sm text-muted-foreground mt-1 text-center">Elige una contraseña nueva para tu cuenta</p>
          </div>

          {done ? (
            <div className="text-center text-sm text-muted-foreground">
              Contraseña actualizada. Redirigiendo…
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-sm font-medium">Contraseña nueva</Label>
                <Input
                  id="password" type="password" placeholder="••••••••"
                  value={password} onChange={(e) => setPassword(e.target.value)} disabled={isLoading}
                  className="h-11 rounded-xl border-border/60 focus-visible:ring-primary/30" autoComplete="new-password"
                />
                {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="confirm" className="text-sm font-medium">Repite la contraseña</Label>
                <Input
                  id="confirm" type="password" placeholder="••••••••"
                  value={confirm} onChange={(e) => setConfirm(e.target.value)} disabled={isLoading}
                  className="h-11 rounded-xl border-border/60 focus-visible:ring-primary/30" autoComplete="new-password"
                />
                {errors.confirm && <p className="text-xs text-destructive">{errors.confirm}</p>}
              </div>
              <Button
                type="submit"
                className="w-full h-11 rounded-xl font-semibold text-sm mt-2"
                style={{ background: 'linear-gradient(135deg, hsl(262,73%,55%), hsl(282,73%,62%))' }}
                disabled={isLoading}
              >
                {isLoading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Guardando...</>) : 'Guardar contraseña'}
              </Button>
            </form>
          )}
        </div>
        <p className="text-center text-xs text-muted-foreground/50 mt-6">Flipr · Panel privado</p>
      </div>
    </div>
  );
}
