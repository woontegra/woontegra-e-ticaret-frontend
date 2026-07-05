import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Layers } from 'lucide-react';
import { listProducts } from '@/shared/api/products.api';
import { ListPageShell } from '@/admin/components/ui';
import { TableQueryState } from '@/admin/components/TableQueryState';
import {
  FilterBar,
  Pagination,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from '@/shared/ui';

const PAGE_SIZE = 20;

export function ProductVariantsPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const queryParams = useMemo(
    () => ({
      search: search || undefined,
      page,
      limit: PAGE_SIZE,
    }),
    [search, page],
  );

  const productsQuery = useQuery({
    queryKey: ['admin', 'products', 'variants-overview', queryParams],
    queryFn: () => listProducts(queryParams),
  });

  const items = productsQuery.data?.items ?? [];
  const total = productsQuery.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <ListPageShell
      title="Varyant Yönetimi"
      description="Ürün bazında varyant tanımlarını düzenleyin. Varyantlar ilgili ürünün düzenleme ekranından yönetilir."
      filters={
        <FilterBar
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Ürün adı veya SKU ara…"
        />
      }
      footer={
        <Pagination
          page={page}
          totalPages={totalPages}
          total={total}
          pageSize={PAGE_SIZE}
          onPageChange={setPage}
        />
      }
    >
      <Table>
        <TableHead>
          <TableRow>
            <TableHeaderCell>Ürün</TableHeaderCell>
            <TableHeaderCell>SKU</TableHeaderCell>
            <TableHeaderCell className="text-right">İşlem</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableQueryState
            colSpan={3}
            isLoading={productsQuery.isLoading}
            isError={productsQuery.isError}
            isEmpty={items.length === 0}
            emptyMessage="Varyant yönetilecek ürün bulunamadı."
          >
            {items.map((product) => (
              <TableRow key={product.id}>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell className="text-[rgb(var(--admin-text-muted))]">
                  {product.sku ?? '—'}
                </TableCell>
                <TableCell className="text-right">
                  <Link
                    to={`/admin/products/${product.id}/edit?tab=variants`}
                    className="inline-flex items-center gap-1.5 rounded-md border border-[rgb(var(--admin-border))] bg-[rgb(var(--admin-surface))] px-2.5 py-1.5 text-xs font-medium text-[rgb(var(--admin-text))] transition-colors hover:bg-[rgb(var(--admin-surface-muted))]"
                  >
                    <Layers className="h-3.5 w-3.5" />
                    Varyantları yönet
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableQueryState>
        </TableBody>
      </Table>
    </ListPageShell>
  );
}
