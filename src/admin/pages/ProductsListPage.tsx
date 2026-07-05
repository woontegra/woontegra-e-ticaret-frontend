import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import type { ProductKind, ProductStatus } from '@/shared/types/api';
import {
  deleteProduct,
  listProductCategories,
  listProducts,
  PRODUCT_KIND_LABELS,
  PRODUCT_STATUS_LABELS,
} from '@/shared/api/products.api';
import { ProductsSubNav } from '@/admin/components/ProductsSubNav';
import { useDisclosure } from '@/shared/hooks/useDisclosure';
import {
  Badge,
  Button,
  Card,
  CardHeader,
  FilterBar,
  Modal,
  Select,
  Table,
  TableBody,
  TableCell,
  TableEmpty,
  TableHead,
  TableHeaderCell,
  TableRow,
} from '@/shared/ui';

export function ProductsListPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const deleteModal = useDisclosure();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProductStatus | ''>('');
  const [kindFilter, setKindFilter] = useState<ProductKind | ''>('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [productToDelete, setProductToDelete] = useState<string | null>(null);

  const queryParams = useMemo(
    () => ({
      search: search || undefined,
      status: statusFilter || undefined,
      productKind: kindFilter || undefined,
      categoryId: categoryFilter || undefined,
    }),
    [search, statusFilter, kindFilter, categoryFilter],
  );

  const productsQuery = useQuery({
    queryKey: ['admin', 'products', queryParams],
    queryFn: () => listProducts(queryParams),
  });

  const categoriesQuery = useQuery({
    queryKey: ['admin', 'product-categories'],
    queryFn: listProductCategories,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
      queryClient.invalidateQueries({ queryKey: ['public', 'products'] });
      deleteModal.close();
      setProductToDelete(null);
    },
  });

  return (
    <>
      <ProductsSubNav />
      <Card padding="sm">
        <CardHeader
          title="Ürünler / Yazılımlar"
          description="Ürün ve yazılım kayıtlarını yönetin"
          action={
            <Button size="sm" onClick={() => navigate('/admin/products/new')}>
              <Plus className="h-4 w-4" />
              Yeni ekle
            </Button>
          }
        />

        <FilterBar
          className="mb-4"
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Ad, slug veya SKU ara…"
        >
          <Select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value as ProductStatus | '')
            }
          >
            <option value="">Tüm durumlar</option>
            {Object.entries(PRODUCT_STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
          <Select
            value={kindFilter}
            onChange={(event) =>
              setKindFilter(event.target.value as ProductKind | '')
            }
          >
            <option value="">Tüm türler</option>
            {Object.entries(PRODUCT_KIND_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
          <Select
            value={categoryFilter}
            onChange={(event) => setCategoryFilter(event.target.value)}
          >
            <option value="">Tüm kategoriler</option>
            {categoriesQuery.data?.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </Select>
        </FilterBar>

        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>Ad</TableHeaderCell>
              <TableHeaderCell>Tür</TableHeaderCell>
              <TableHeaderCell>Kategori</TableHeaderCell>
              <TableHeaderCell>Durum</TableHeaderCell>
              <TableHeaderCell className="text-right">İşlem</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {productsQuery.isLoading ? (
              <TableEmpty colSpan={5} message="Yükleniyor…" />
            ) : (productsQuery.data?.items.length ?? 0) === 0 ? (
              <TableEmpty colSpan={5} message="Henüz ürün eklenmedi." />
            ) : (
              productsQuery.data!.items.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium text-slate-900">{product.name}</p>
                      <p className="text-xs text-slate-400">{product.slug}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    {PRODUCT_KIND_LABELS[product.productKind]}
                  </TableCell>
                  <TableCell>{product.category?.name ?? '—'}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        product.status === 'ACTIVE'
                          ? 'success'
                          : product.status === 'DRAFT'
                            ? 'warning'
                            : 'default'
                      }
                    >
                      {PRODUCT_STATUS_LABELS[product.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          navigate(`/admin/products/${product.id}`)
                        }
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setProductToDelete(product.id);
                          deleteModal.open();
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      <Modal
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.close}
        title="Ürünü sil"
        size="sm"
      >
        <p className="text-sm text-slate-600">
          Bu ürün kalıcı olarak silinecek. Devam etmek istiyor musunuz?
        </p>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="secondary" onClick={deleteModal.close}>
            İptal
          </Button>
          <Button
            variant="danger"
            disabled={!productToDelete || deleteMutation.isPending}
            onClick={() =>
              productToDelete && deleteMutation.mutate(productToDelete)
            }
          >
            Sil
          </Button>
        </div>
      </Modal>
    </>
  );
}
