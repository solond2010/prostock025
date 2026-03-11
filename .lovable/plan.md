

## Plan: Inventario de Repuestos

Nueva sección "Inventario Piezas" para llevar control manual de repuestos de iPhone en oficina. Sin precios, solo nombre/descripción y gestión manual (añadir/eliminar).

### Base de datos
Crear tabla `repuestos_inventario`:
- `id` (uuid, PK)
- `nombre` (text, NOT NULL) — ej: "Pantalla iPhone 12"
- `cantidad` (integer, default 1)
- `notas` (text, nullable)
- `created_at` (timestamptz)

Con RLS para usuarios autenticados (mismo patrón que las demás tablas).

### Frontend
1. **Nueva ruta** `/inventario-piezas` en `App.tsx` con ProtectedRoute + MainLayout
2. **Nueva entrada en sidebar** con icono `Wrench` — "Inventario Piezas"
3. **Nueva página** `src/pages/InventarioPiezas.tsx`:
   - Lista de repuestos en tabla simple (Nombre, Cantidad, Notas, Acciones)
   - Botón "Añadir pieza" que abre un diálogo con campos: nombre, cantidad (default 1), notas (opcional)
   - Botón eliminar en cada fila con confirmación
   - Buscador simple para filtrar por nombre
4. **Hook** `src/hooks/useRepuestos.ts` — CRUD con react-query contra la nueva tabla

### Técnico
- Misma arquitectura que el resto de módulos (query + mutations con sonner toasts)
- Sin campos de precio ni fechas de venta, solo inventario básico

