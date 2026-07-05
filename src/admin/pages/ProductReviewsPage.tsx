import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Eye } from 'lucide-react';
import type { ProductReviewStatus } from '@/shared/types/api';
import {
  getProductReview,
  listProductReviews,
  PRODUCT_REVIEW_STATUS_LABELS,
} from '@/shared/api/reviews.api';
import { ReviewsSubNav } from '@/admin/components/ReviewsSubNav';
import { ProductReviewDetailPanel } from '@/admin/components/ProductReviewDetailPanel';
import { StarRatingDisplay } from '@/storefront/components/StarRating';
import {
  Badge,
  Button,
  Card,
  CardHeader,
  Drawer,
  Input,
  Label,
  Table,
  TableBody,
  TableCell,
  TableEmpty,
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

  const handleStatusChange = (status: ProductReviewStatus | '') => {
    setStatusFilter(status);
    setPage(1);
  };

  return (
    <>
      <ReviewsSubNav
        activeStatus={statusFilter}
        onChange={handleStatusChange}
      />
      <Card padding="sm">
        <CardHeader
          title="Ürün yorumları"
          description="Public formlardan gelen yorumlar onay sonrası yayına alınır"
        />

        <div className="mb-4">
          <Label>Ara</Label>
          <Input
            value={search}
            placeholder="Ad, e-posta, ürün, yorum…"
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>

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
            {reviewsQuery.isLoading ? (
              <TableEmpty colSpan={6} message="Yükleniyor…" />
            ) : (reviewsQuery.data?.items.length ?? 0) === 0 ? (
              <TableEmpty colSpan={6} message="Bu filtrede yorum yok." />
            ) : (
              reviewsQuery.data!.items.map((item) => (
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
              ))
            )}
          </TableBody>
        </Table>

        {totalPages > 1 ? (
          <div className="mt-4 flex items-center justify-between text-sm">
            <span className="text-slate-500">
              Toplam {total} yorum · Sayfa {page}/{totalPages}
            </span>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="secondary"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Önceki
              </Button>
              <Button
                size="sm"
                variant="secondary"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Sonraki
              </Button>
            </div>
          </div>
        ) : null}
      </Card>

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
