import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Eye } from 'lucide-react';
import type { ProductReviewStatus } from '@/shared/types/api';
import {
  getProductReview,
  listProductReviews,
  PRODUCT_REVIEW_STATUS_LABELS,
} from '@/shared/api/reviews.api';
import { AdminPanel } from '@/admin/components/AdminPanel';
import { ReviewsSubNav } from '@/admin/components/ReviewsSubNav';
import { ProductReviewDetailPanel } from '@/admin/components/ProductReviewDetailPanel';
import { TableQueryState } from '@/admin/components/TableQueryState';
import { StarRatingDisplay } from '@/storefront/components/StarRating';
import {
  Badge,
  Button,
  Drawer,
  FilterBar,
  Pagination,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from '@/shared/ui';

const PAGE_SIZE = 20;

export function ProductReviewsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProductReviewStatus | ''>(
    'PENDING',
  );
  const [page, setPage] = useState(1);
  const [drawerId, setDrawerId] = useState<string | null>(null);

  const queryParams = useMemo(
    () => ({
      search: search || undefined,
      status: statusFilter || undefined,
      page,
      limit: PAGE_SIZE,
    }),
    [search, statusFilter, page],
  );

  const reviewsQuery = useQuery({
    queryKey: ['admin', 'product-reviews', queryParams],
    queryFn: () => listProductReviews(queryParams),
  });

  const drawerQuery = useQuery({
    queryKey: ['admin', 'product-reviews', drawerId],
    queryFn: () => getProductReview(drawerId!),
    enabled: Boolean(drawerId),
  });

  const total = reviewsQuery.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const items = reviewsQuery.data?.items ?? [];

  const handleStatusChange = (status: ProductReviewStatus | '') => {
    setStatusFilter(status);
    setPage(1);
  };

  return (
    <>
      <ReviewsSubNav />
      <AdminPanel
        filters={
          <FilterBar
            searchValue={search}
            onSearchChange={(value) => {
              setSearch(value);
              setPage(1);
            }}
            searchPlaceholder="Ad, e-posta, ürün, yorum…"
          >
            <Select
              value={statusFilter}
              onChange={(e) =>
                handleStatusChange(e.target.value as ProductReviewStatus | '')
              }
              className="h-8 text-xs"
            >
              <option value="">Tüm durumlar</option>
              {Object.entries(PRODUCT_REVIEW_STATUS_LABELS).map(
                ([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ),
              )}
            </Select>
          </FilterBar>
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
              <TableHeaderCell>Tarih</TableHeaderCell>
              <TableHeaderCell>Ürün</TableHeaderCell>
              <TableHeaderCell>Yorumcu</TableHeaderCell>
              <TableHeaderCell>Puan</TableHeaderCell>
              <TableHeaderCell>Durum</TableHeaderCell>
              <TableHeaderCell className="text-right">İşlem</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableQueryState
              colSpan={6}
              isLoading={reviewsQuery.isLoading}
              isError={reviewsQuery.isError}
              isEmpty={items.length === 0}
              emptyMessage="Bu filtrede yorum yok."
            >
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="text-slate-500">
                    {new Date(item.createdAt).toLocaleString('tr-TR')}
                  </TableCell>
                  <TableCell>{item.productName ?? '—'}</TableCell>
                  <TableCell>
                    <p>{item.name}</p>
                    {item.title ? (
                      <p className="text-xs text-slate-500">{item.title}</p>
                    ) : null}
                  </TableCell>
                  <TableCell>
                    <StarRatingDisplay rating={item.rating} size="sm" />
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        item.status === 'PENDING'
                          ? 'warning'
                          : item.status === 'REJECTED'
                            ? 'danger'
                            : 'success'
                      }
                    >
                      {PRODUCT_REVIEW_STATUS_LABELS[item.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDrawerId(item.id)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableQueryState>
          </TableBody>
        </Table>
      </AdminPanel>

      <Drawer
        isOpen={Boolean(drawerId)}
        onClose={() => setDrawerId(null)}
        title="Yorum detayı"
        size="lg"
      >
        {drawerQuery.data ? (
          <ProductReviewDetailPanel
            review={drawerQuery.data}
            onDeleted={() => setDrawerId(null)}
          />
        ) : (
          <p className="text-sm text-slate-500">Yükleniyor…</p>
        )}
      </Drawer>
    </>
  );
}
