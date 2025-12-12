import { Receipt } from 'lucide-react';

const GastoMaterial = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="rounded-lg bg-primary p-2">
            <Receipt className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Gasto en Material</h1>
            <p className="text-sm text-muted-foreground">Registra tus gastos en materiales y suministros</p>
          </div>
        </div>
        
        <div className="rounded-lg border border-border bg-card p-12 text-center">
          <Receipt className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
          <p className="text-muted-foreground">Esta sección estará disponible próximamente.</p>
          <p className="text-sm text-muted-foreground/70 mt-2">Aquí podrás registrar y gestionar tus gastos en materiales.</p>
        </div>
      </div>
    </div>
  );
};

export default GastoMaterial;
