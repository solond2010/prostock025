import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { SummaryCards } from '@/components/stock/SummaryCards';
import { StockFilters } from '@/components/stock/StockFilters';
import { StockTable } from '@/components/stock/StockTable';
import { StockItemDialog } from '@/components/stock/StockItemDialog';
import { ProductDetailSheet } from '@/components/stock/ProductDetailSheet';
import { InventorySidebar } from '@/components/stock/InventorySidebar';
import { DuplicateProductDialog } from '@/components/stock/DuplicateProductDialog';
import { SellProductDialog } from '@/components/stock/SellProductDialog';
import {
  useStockItems,
  useCreateStockItem,
  useUpdateStockItem,
  useDeleteStockItem,
  useDuplicateStockItem,
} from '@/hooks/useStockItems';
import { StockItem, StockItemFormData, StockItemWithCalculations, StockSummary, CurrentStockSummary } from '@/types/stock';
import { Plus, Package, BarChart3, TrendingUp, FileSpreadsheet } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
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
  const duplicateMutation = useDuplicateStockItem();
  const { toast } = useToast();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<StockItem | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'En stock' | 'Vendido'>('all');
  const [detailItem, setDetailItem] = useState<StockItemWithCalculations | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [duplicateItem, setDuplicateItem] = useState<StockItemWithCalculations | null>(null);
  const [sellItem, setSellItem] = useState<StockItemWithCalculations | null>(null);

  // Get unique categories
  const categories = useMemo(() => {
    const cats = new Set(items.map((item) => item.category));
    return Array.from(cats).sort();
  }, [items]);

  // Calculate derived values and filter (assuming 1 unit per product)
  const processedItems = useMemo<StockItemWithCalculations[]>(() => {
    return items
      .filter((item) => {
        const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
        const matchesStatus = statusFilter === 'all' || item.estado === statusFilter;
        return matchesSearch && matchesCategory && matchesStatus;
      })
      .map((item) => {
        const coste_total =
          Number(item.purchase_price_per_unit) +
          Number(item.precio_envio) +
          Number(item.coste_reparacion);
        const beneficio_esperado = Number(item.sale_price_per_unit) - coste_total;
        const beneficio_real =
          item.estado === 'Vendido' ? Number(item.precio_venta_real) - coste_total : null;
        return { ...item, coste_total, beneficio_esperado, beneficio_real };
      });
  }, [items, searchQuery, categoryFilter, statusFilter]);

  // Calculate summary (assuming 1 unit per product)
  const summary = useMemo<StockSummary>(() => {
    let totalInvested = 0;
    let totalExpectedRevenue = 0;
    let totalRealProfit = 0;

    items.forEach((item) => {
      const coste_total =
        Number(item.purchase_price_per_unit) +
        Number(item.precio_envio) +
        Number(item.coste_reparacion);
      totalInvested += coste_total;
      totalExpectedRevenue += Number(item.sale_price_per_unit);

      if (item.estado === 'Vendido') {
        totalRealProfit += Number(item.precio_venta_real) - coste_total;
      }
    });

    const totalExpectedProfit = totalExpectedRevenue - totalInvested;
    const profitMargin = totalExpectedRevenue > 0 ? (totalExpectedProfit / totalExpectedRevenue) * 100 : 0;

    return { totalInvested, totalExpectedRevenue, totalExpectedProfit, totalRealProfit, profitMargin };
  }, [items]);

  // Calculate current stock summary (only "En stock" items)
  const currentSummary = useMemo<CurrentStockSummary>(() => {
    let totalInvestedCurrent = 0;
    let expectedRevenueCurrent = 0;

    items.forEach((item) => {
      if (item.estado === 'En stock') {
        const coste_total =
          Number(item.purchase_price_per_unit) +
          Number(item.precio_envio) +
          Number(item.coste_reparacion);
        totalInvestedCurrent += coste_total;
        expectedRevenueCurrent += Number(item.sale_price_per_unit);
      }
    });

    const possibleProfitCurrent = expectedRevenueCurrent - totalInvestedCurrent;
    const possibleMarginCurrent = expectedRevenueCurrent > 0 ? (possibleProfitCurrent / expectedRevenueCurrent) * 100 : 0;

    return { totalInvestedCurrent, expectedRevenueCurrent, possibleProfitCurrent, possibleMarginCurrent };
  }, [items]);

  const handleAddClick = () => {
    setEditingItem(null);
    setDialogOpen(true);
  };

  const handleItemClick = (item: StockItemWithCalculations) => {
    setDetailItem(item);
    setDetailOpen(true);
  };

  const handleEdit = (item: StockItemWithCalculations) => {
    setEditingItem(item);
    setDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setDeleteId(id);
  };

  const handleDuplicateClick = (item: StockItemWithCalculations) => {
    setDuplicateItem(item);
  };

  const handleDuplicateConfirm = (count: number) => {
    if (duplicateItem) {
      duplicateMutation.mutate(
        { item: duplicateItem, count },
        { onSuccess: () => setDuplicateItem(null) }
      );
    }
  };

  const handleSellClick = (item: StockItemWithCalculations) => {
    setSellItem(item);
  };

  const handleSellConfirm = (id: string, fechaVenta: string, precioVentaReal: number) => {
    updateMutation.mutate(
      {
        id,
        item: {
          estado: 'Vendido',
          fecha_venta: fechaVenta,
          precio_venta_real: precioVentaReal,
        } as Partial<StockItemFormData>,
      },
      {
        onSuccess: () => {
          setSellItem(null);
          toast({
            title: '✅ Producto marcado como vendido',
            description: `La venta se ha registrado correctamente`,
          });
        },
      }
    );
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

  const handleExportCSV = () => {
    const headers = [
      'Nombre',
      'Estado',
      'Categoría',
      'Coste total (€)',
      'Precio venta esperado (€)',
      'Beneficio (€)',
      'Fecha compra',
      'Fecha venta',
      'Notas',
      'Color',
      'Talla',
    ];

    const csvRows = [headers.join(',')];

    items.forEach((item) => {
      const costeTotal =
        Number(item.purchase_price_per_unit) +
        Number(item.precio_envio) +
        Number(item.coste_reparacion);
      
      const beneficio =
        item.estado === 'Vendido'
          ? Number(item.precio_venta_real) - costeTotal
          : Number(item.sale_price_per_unit) - costeTotal;

      const row = [
        `"${item.name.replace(/"/g, '""')}"`,
        item.estado,
        item.category,
        costeTotal.toFixed(2),
        item.sale_price_per_unit ? Number(item.sale_price_per_unit).toFixed(2) : '',
        beneficio.toFixed(2),
        item.purchase_date || '',
        item.fecha_venta || '',
        item.notes ? `"${item.notes.replace(/"/g, '""')}"` : '',
        item.color || '',
        item.talla || '',
      ];

      csvRows.push(row.join(','));
    });

    const csvContent = '\uFEFF' + csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const today = format(new Date(), 'yyyy-MM-dd');
    link.setAttribute('href', url);
    link.setAttribute('download', `stock_export_${today}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: 'Exportación generada ✅',
      description: `Se han exportado ${items.length} productos a CSV`,
    });
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
      <div className="mx-auto max-w-7xl px-3 py-4 sm:px-6 sm:py-8 lg:max-w-[1550px] lg:px-10 xl:px-12">
        {/* Header */}
        <div className="mb-4 sm:mb-8 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="rounded-lg bg-primary p-1.5 sm:p-2 shrink-0">
              <Package className="h-5 w-5 sm:h-6 sm:w-6 text-primary-foreground" />
            </div>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-2xl font-semibold text-foreground truncate">Gestor de Stock</h1>
              <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">Controla tu inventario y beneficios</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Link to="/graficos" className="hidden sm:block">
              <Button variant="outline">
                <BarChart3 className="mr-2 h-4 w-4" />
                Gráficos
              </Button>
            </Link>
            <Button onClick={handleAddClick} size="sm" className="sm:size-default">
              <Plus className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Añadir Producto</span>
            </Button>
          </div>
        </div>

        {/* Mobile Inventory Stats */}
        <div className="mb-4 grid grid-cols-2 gap-2 sm:hidden">
          <div className="rounded-lg border border-border bg-card/50 p-3 flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-secondary shrink-0">
              <Package className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground">En stock</p>
              <p className="text-base font-semibold text-foreground">{items.filter(i => i.estado === 'En stock').length}</p>
            </div>
          </div>
          <div className="rounded-lg border border-border bg-card/50 p-3 flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-secondary shrink-0">
              <TrendingUp className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground">Vendidos mes</p>
              <p className="text-base font-semibold text-foreground">
                {items.filter((item) => {
                  if (item.estado !== 'Vendido' || !item.fecha_venta) return false;
                  const now = new Date();
                  const saleDate = new Date(item.fecha_venta);
                  return saleDate.getMonth() === now.getMonth() && saleDate.getFullYear() === now.getFullYear();
                }).length}
              </p>
            </div>
          </div>
        </div>

        {/* Main Content with Sidebar */}
        <div className="flex flex-col lg:flex-row lg:justify-between gap-4 lg:gap-8">
          {/* Left: Main Content */}
          <div className="flex-1 min-w-0 lg:max-w-5xl">
            {/* Summary Cards */}
            <div className="mb-4 sm:mb-8">
              <SummaryCards summary={summary} currentSummary={currentSummary} stockItems={items} />
            </div>

            {/* Filters */}
            <div className="mb-4 sm:mb-6">
              <StockFilters
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                categoryFilter={categoryFilter}
                onCategoryChange={setCategoryFilter}
                categories={categories}
                statusFilter={statusFilter}
                onStatusChange={setStatusFilter}
              />
            </div>

            {/* Table */}
            <StockTable 
              items={processedItems} 
              onItemClick={handleItemClick} 
              onDuplicateClick={handleDuplicateClick}
              onSellClick={handleSellClick}
            />
          </div>

          {/* Right: Inventory Sidebar - hidden on mobile, shown on lg+ */}
          <div className="hidden lg:block shrink-0">
            <InventorySidebar items={items} />
          </div>
        </div>

        {/* Product Detail Sheet */}
        <ProductDetailSheet
          item={detailItem}
          open={detailOpen}
          onOpenChange={setDetailOpen}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />

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

        {/* Duplicate Product Dialog */}
        <DuplicateProductDialog
          open={!!duplicateItem}
          onOpenChange={(open) => !open && setDuplicateItem(null)}
          productName={duplicateItem?.name || ''}
          onConfirm={handleDuplicateConfirm}
          isLoading={duplicateMutation.isPending}
        />

        {/* Sell Product Dialog */}
        <SellProductDialog
          open={!!sellItem}
          onOpenChange={(open) => !open && setSellItem(null)}
          item={sellItem}
          onConfirm={handleSellConfirm}
          isLoading={updateMutation.isPending}
        />

        {/* Floating Export Button */}
        <Button
          onClick={handleExportCSV}
          className="fixed bottom-6 right-6 z-50 shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95"
          size="lg"
        >
          <FileSpreadsheet className="mr-2 h-5 w-5" />
          <span className="hidden sm:inline">Exportar Excel</span>
          <span className="sm:hidden">Exportar</span>
        </Button>
      </div>
    </div>
  );
};

export default Index;
