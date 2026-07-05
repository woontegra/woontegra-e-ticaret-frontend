import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ExternalLink, Pencil, Plus, Trash2 } from 'lucide-react';
import type { DeliveryMode, ProductDto, ProductStatus } from '@/shared/types/api';
import {
  deleteProduct,
  DELIVERY_MODE_LABELS,
  getProductPublicPath,
  listProductCategories,
  listProducts,
  updateProduct,
} from '@/shared/api/products.api';
import { ListPageShell } from '@/admin/components/ui';
import { TableQueryState } from '@/admin/components/TableQueryState';
import {
  formatProductPrice,
  getProductBadges,
  getProductDeliveryStatusLabel,
  getProductLicenseStatusLabel,
  getProductSaleStatusLabel,
  PRODUCT_BADGE_LABELS,
} from '@/admin/lib/productAdminDisplay';
import { useAdminMutationFeedback } from '@/admin/hooks/useAdminMutationFeedback';
import { useDisclosure } from '@/shared/hooks/useDisclosure';
import {
  Badge,
  Button,
  ConfirmDialog,
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

export function ProductsListPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const deleteModal = useDisclosure();
  const { onSuccess, onError } = useAdminMutationFeedback();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProductStatus | ''>('');
  const [deliveryFilter, setDeliveryFilter] = useState<DeliveryMode | ''>('');
  const [licenseFilter, setLicenseFilter] = useState<'all' | 'yes' | 'no'>('all');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [page, setPage] = useState(1);
  const [productToDelete, setProductToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, deliveryFilter, licenseFilter, categoryFilter]);

  const queryParams = useMemo(
    () => ({
      search: search || undefined,
      status: statusFilter || undefined,
      deliveryMode: deliveryFilter || undefined,
      licenseRequired:
        licenseFilter === 'all'
          ? undefined
          : licenseFilter === 'yes',
      categoryId: categoryFilter || undefined,
      page,
      limit: PAGE_SIZE,
    }),
    [search, statusFilter, deliveryFilter, licenseFilter, categoryFilter, page],
  );

  const productsQuery = useQuery({
    queryKey: ['admin', 'products', queryParams],
    queryFn: () => listProducts(queryParams),
  });

  const categoriesQuery = useQuery({
    queryKey: ['admin', 'product-categories', 'options'],
    queryFn: () => listProductCategories({ limit: 200 }),
    select: (data) => data.items,
  });

  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: ProductStatus }) =>
      updateProduct(id, {
        status: status === 'ACTIVE' ? 'PASSIVE' : 'ACTIVE',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
      onSuccess('Durum güncellendi.');
    },
    onError: (error) => onError(error, 'Durum güncellenemedi.'),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
      queryClient.invalidateQueries({ queryKey: ['public', 'products'] });
      deleteModal.close();
      setProductToDelete(null);
      onSuccess('Ürün silindi.');
    },
    onError: (error) => onError(error, 'Ürün silinemedi.'),
  });

  const total = productsQuery.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const items = productsQuery.data?.items ?? [];

  return (
    <>
      <ListPageShell
        title="Ürünler / Yazılımlar"
        description="Katalog ürünlerini, teslimat modlarını ve yayın durumlarını yönetin"
        actions={
          <Button size="sm" onClick={() => navigate('/admin/products/new')}>
            <Plus className="h-4 w-4" />
            Yeni ürün
          </Button>
        }
        filters={
          <FilterBar
            searchValue={search}
            onSearchChange={setSearch}
            searchPlaceholder="Ad veya slug ara…"
          >
            <Select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as ProductStatus | '')
              }
              className="h-8 text-xs"
            >
              <option value="">Tüm durumlar</option>
              <option value="ACTIVE">Yayında</option>
              <option value="DRAFT">Taslak</option>
              <option value="PASSIVE">Pasif</option>
            </Select>
            <Select
              value={deliveryFilter}
              onChange={(e) =>
                setDeliveryFilter(e.target.value as DeliveryMode | '')
              }
              className="h-8 text-xs"
            >
              <option value="">Tüm teslimat modları</option>
              {Object.entries(DELIVERY_MODE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
            <Select
              value={licenseFilter}
              onChange={(e) =>
                setLicenseFilter(e.target.value as 'all' | 'yes' | 'no')
              }
              className="h-8 text-xs"
            >
              <option value="all">Lisans: tümü</option>
              <option value="yes">Lisanslı</option>
              <option value="no">Lisanssız</option>
            </Select>
            <Select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="h-8 text-xs"
            >
              <option value="">Tüm kategoriler</option>
              {categoriesQuery.data?.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
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
              <TableHeaderCell>Ürün</TableHeaderCell>
              <TableHeaderCell>Kategori</TableHeaderCell>
              <TableHeaderCell>Fiyat</TableHeaderCell>
              <TableHeaderCell>Satış</TableHeaderCell>
              <TableHeaderCell>Teslimat</TableHeaderCell>
              <TableHeaderCell>Lisans</TableHeaderCell>
              <TableHeaderCell>Görsel</TableHeaderCell>
              <TableHeaderCell>Güncelleme</TableHeaderCell>
              <TableHeaderCell className="text-right">İşlem</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableQueryState
              colSpan={9}
              isLoading={productsQuery.isLoading}
              isError={productsQuery.isError}
              isEmpty={items.length === 0}
              emptyMessage="Henüz ürün eklenmedi."
            >
              {items.map((product) => (
                <ProductRow
                  key={product.id}
                  product={product}
                  onEdit={() => navigate(`/admin/products/${product.id}/edit`)}
                  onToggleStatus={() =>
                    toggleStatusMutation.mutate({
                      id: product.id,
                      status: product.status,
                    })
                  }
                  onDelete={() => {
                    setProductToDelete({
                      id: product.id,
                      name: product.name,
                    });
                    deleteModal.open();
                  }}
                  isToggling={toggleStatusMutation.isPending}
                />
              ))}
            </TableQueryState>
          </TableBody>
        </Table>
      </ListPageShell>

      <ConfirmDialog
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.close}
        title="Ürünü sil"
        description={
          productToDelete
            ? `"${productToDelete.name}" kalıcı olarak silinecek. Devam edilsin mi?`
            : 'Bu ürün kalıcı olarak silinecek.'
        }
        confirmLabel="Sil"
        isLoading={deleteMutation.isPending}
        onConfirm={() =>
          productToDelete && deleteMutation.mutate(productToDelete.id)
        }
      />
    </>
  );
}

function ProductRow({
  product,
  onEdit,
  onToggleStatus,
  onDelete,
  isToggling,
}: {
  product: ProductDto;
  onEdit: () => void;
  onToggleStatus: () => void;
  onDelete: () => void;
  isToggling: boolean;
}) {
  const badges = getProductBadges(product);
  const licenseLabel = getProductLicenseStatusLabel(product);
  const publicPath =
    product.status === 'ACTIVE'
      ? getProductPublicPath({
          slug: product.slug,
          productKind: product.productKind,
        })
      : null;

  return (
    <TableRow>
      <TableCell>
        <div className="min-w-0 space-y-1">
          <p className="truncate font-medium text-[rgb(var(--admin-text))]">
            {product.name}
          </p>
          <p className="truncate text-xs text-[rgb(var(--admin-text-muted))]">
            {product.slug}
          </p>
          <div className="flex flex-wrap gap-1">
            {badges.map((badge) => (
              <Badge key={badge} variant="default">
                {PRODUCT_BADGE_LABELS[badge]}
              </Badge>
            ))}
          </div>
        </div>
      </TableCell>
      <TableCell>{product.category?.name ?? '—'}</TableCell>
      <TableCell>{formatProductPrice(product)}</TableCell>
      <TableCell className="text-sm">
        {getProductSaleStatusLabel(product)}
      </TableCell>
      <TableCell className="text-sm">
        {getProductDeliveryStatusLabel(product)}
      </TableCell>
      <TableCell>
        <span
          className={
            product.licenseRequired
              ? 'font-mono text-xs text-[rgb(var(--admin-primary))]'
              : 'text-sm text-[rgb(var(--admin-text-muted))]'
          }
        >
          {licenseLabel}
        </span>
      </TableCell>
      <TableCell>
        <Badge variant={product.mainImageId ? 'success' : 'default'}>
          {product.mainImageId ? 'Var' : 'Yok'}
        </Badge>
      </TableCell>
      <TableCell className="whitespace-nowrap text-xs text-[rgb(var(--admin-text-muted))]">
        {new Date(product.updatedAt).toLocaleDateString('tr-TR', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        })}
      </TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-0.5">
          {publicPath ? (
            <Link
              to={publicPath}
              target="_blank"
              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-[rgb(var(--admin-text-muted))] hover:bg-[rgb(var(--admin-sidebar-hover))]"
              aria-label="Görüntüle"
            >
              <ExternalLink className="h-4 w-4" />
            </Link>
          ) : null}
          <Button variant="ghost" size="sm" aria-label="Düzenle" onClick={onEdit}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            disabled={isToggling}
            onClick={onToggleStatus}
          >
            {product.status === 'ACTIVE' ? 'Pasif' : 'Aktif'}
          </Button>
          <Button variant="ghost" size="sm" aria-label="Sil" onClick={onDelete}>
            <Trash2 className="h-4 w-4 text-red-600" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}
