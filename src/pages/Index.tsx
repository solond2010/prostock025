import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { SummaryCards } from '@/components/stock/SummaryCards';
import { StockFilters } from '@/components/stock/StockFilters';
import { StockTable } from '@/components/stock/StockTable';
import { StockItemDialog } from '@/components/stock/StockItemDialog';
import {
  useStockItems,
  useCreateStockItem,
  useUpdateStockItem,
  useDeleteStockItem,
} from '@/hooks/useStockItems';
import { StockItem, StockItemFormData, StockItemWithCalculations, StockSummary } from '@/types/stock';
import { Plus, Package } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const Index = () => {
  const { data: items = [], isLoading } = useStockItems();
  const createMutation = useCreateStockItem();
  const updateMutation = useUpdateStockItem();
  const deleteMutation = useDeleteStockItem();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<StockItem | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Get unique categories
  const categories = useMemo(() => {
    const cats = new Set(items.map((item) => item.category));
    return Array.from(cats).sort();
  }, [items]);

  // Calculate derived values and filter
  const processedItems = useMemo<StockItemWithCalculations[]>(() => {
    return items
      .filter((item) => {
        const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
        return matchesSearch && matchesCategory;
      })
      .map((item) => {
        const coste_total =
          Number(item.purchase_price_per_unit) * item.units_in_stock +
          Number(item.precio_envio) +
          Number(item.coste_reparacion);
        const beneficio_esperado = Number(item.sale_price_per_unit) * item.units_in_stock - coste_total;
        const beneficio_real =
          item.estado === 'Vendido' ? Number(item.precio_venta_real) - coste_total : null;
        return { ...item, coste_total, beneficio_esperado, beneficio_real };
      });
  }, [items, searchQuery, categoryFilter]);

  // Calculate summary
  const summary = useMemo<StockSummary>(() => {
    let totalInvested = 0;
    let totalExpectedRevenue = 0;
    let totalRealProfit = 0;

    items.forEach((item) => {
      const coste_total =
        Number(item.purchase_price_per_unit) * item.units_in_stock +
        Number(item.precio_envio) +
        Number(item.coste_reparacion);
      totalInvested += coste_total;
      totalExpectedRevenue += Number(item.sale_price_per_unit) * item.units_in_stock;

      if (item.estado === 'Vendido') {
        totalRealProfit += Number(item.precio_venta_real) - coste_total;
      }
    });

    const totalExpectedProfit = totalExpectedRevenue - totalInvested;
    const profitMargin = totalExpectedRevenue > 0 ? (totalExpectedProfit / totalExpectedRevenue) * 100 : 0;

    return { totalInvested, totalExpectedRevenue, totalExpectedProfit, totalRealProfit, profitMargin };
  }, [items]);

  const handleAddClick = () => {
    setEditingItem(null);
    setDialogOpen(true);
  };

  const handleEdit = (item: StockItemWithCalculations) => {
    setEditingItem(item);
    setDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setDeleteId(id);
  };

  const confirmDelete = () => {
    if (deleteId) {
      deleteMutation.mutate(deleteId);
      setDeleteId(null);
    }
  };

  const handleSubmit = (data: StockItemFormData) => {
    if (editingItem) {
      updateMutation.mutate(
        { id: editingItem.id, item: data },
        { onSuccess: () => setDialogOpen(false) }
      );
    } else {
      createMutation.mutate(data, { onSuccess: () => setDialogOpen(false) });
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-muted-foreground">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary p-2">
              <Package className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-foreground">Gestor de Stock</h1>
              <p className="text-sm text-muted-foreground">Controla tu inventario y beneficios</p>
            </div>
          </div>
          <Button onClick={handleAddClick}>
            <Plus className="mr-2 h-4 w-4" />
            Añadir Producto
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="mb-8">
          <SummaryCards summary={summary} />
        </div>

        {/* Filters */}
        <div className="mb-6">
          <StockFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            categoryFilter={categoryFilter}
            onCategoryChange={setCategoryFilter}
            categories={categories}
          />
        </div>

        {/* Table */}
        <StockTable items={processedItems} onEdit={handleEdit} onDelete={handleDelete} />

        {/* Add/Edit Dialog */}
        <StockItemDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          item={editingItem}
          onSubmit={handleSubmit}
          isLoading={createMutation.isPending || updateMutation.isPending}
        />

        {/* Delete Confirmation */}
        <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Eliminar Producto</AlertDialogTitle>
              <AlertDialogDescription>
                ¿Estás seguro de que quieres eliminar este producto? Esta acción no se puede deshacer.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Eliminar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default Index;
