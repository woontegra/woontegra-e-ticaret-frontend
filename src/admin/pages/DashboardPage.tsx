import {
  Badge,
  Card,
  CardHeader,
  FilterBar,
  Select,
  Table,
  TableBody,
  TableEmpty,
  TableHead,
  TableHeaderCell,
  TableRow,
} from '@/shared/ui';

/**
 * Boş dashboard — widget ve metrikler Dashboard API'den gelecek.
 */
export function DashboardPage() {
  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index} padding="sm">
            <p className="text-xs text-slate-500">Metrik</p>
            <p className="mt-1 text-lg font-semibold text-slate-900">—</p>
          </Card>
        ))}
      </div>

      <Card padding="sm">
        <CardHeader
          title="Son siparişler"
          description="Sipariş modülü bağlandığında doldurulacak"
        />
        <FilterBar searchPlaceholder="Sipariş ara…">
          <Select className="w-36" defaultValue="">
            <option value="">Durum</option>
          </Select>
        </FilterBar>
        <div className="mt-3">
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>Sipariş</TableHeaderCell>
                <TableHeaderCell>Müşteri</TableHeaderCell>
                <TableHeaderCell>Durum</TableHeaderCell>
                <TableHeaderCell className="text-right">Tutar</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableEmpty colSpan={4} message="Henüz sipariş verisi yok" />
            </TableBody>
          </Table>
        </div>
      </Card>

      <div className="flex flex-wrap gap-2">
        <Badge>Panel hazır</Badge>
        <Badge variant="success">Responsive</Badge>
      </div>
    </div>
  );
}
