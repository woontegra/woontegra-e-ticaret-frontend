import type {
  BrandDto,
  FilterableAttributeDto,
  GenerateVariantsResultDto,
  ProductAttributeAssignmentDto,
  ProductAttributeDto,
  ProductAttributeType,
  ProductAttributeValueDto,
  ProductCategoryDto,
  ProductDto,
  ProductKind,
  ProductListResult,
  ProductStatus,
  ProductVariantDto,
  PublicBrandDetailDto,
  PublicBrandSummaryDto,
  PublicCatalogListResult,
  PublicProductCategoryDetailDto,
  PublicProductCategoryDto,
  PublicProductDetailDto,
  PublicProductDto,
  PublicProductSort,
} from '@/shared/types/api';
import { apiClient } from './client';

export const PRODUCT_KIND_LABELS: Record<ProductKind, string> = {
  SOFTWARE: 'Yazılım',
  PHYSICAL: 'Fiziksel ürün',
  SERVICE: 'Hizmet',
};

export const PRODUCT_STATUS_LABELS: Record<ProductStatus, string> = {
  DRAFT: 'Taslak',
  ACTIVE: 'Yayında',
  PASSIVE: 'Pasif',
};

export function slugifyClient(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Categories
export function listProductCategories() {
  return apiClient<ProductCategoryDto[]>('/api/admin/product-categories');
}

export function getProductCategory(id: string) {
  return apiClient<ProductCategoryDto>(`/api/admin/product-categories/${id}`);
}

export function createProductCategory(payload: Partial<ProductCategoryDto>) {
  return apiClient<ProductCategoryDto>('/api/admin/product-categories', {
    method: 'POST',
    body: payload,
  });
}

export function updateProductCategory(
  id: string,
  payload: Partial<ProductCategoryDto>,
) {
  return apiClient<ProductCategoryDto>(`/api/admin/product-categories/${id}`, {
    method: 'PUT',
    body: payload,
  });
}

export function deleteProductCategory(id: string) {
  return apiClient<void>(`/api/admin/product-categories/${id}`, {
    method: 'DELETE',
  });
}

// Brands
export function listBrands() {
  return apiClient<BrandDto[]>('/api/admin/brands');
}

export function getBrand(id: string) {
  return apiClient<BrandDto>(`/api/admin/brands/${id}`);
}

export function createBrand(payload: Partial<BrandDto>) {
  return apiClient<BrandDto>('/api/admin/brands', {
    method: 'POST',
    body: payload,
  });
}

export function updateBrand(id: string, payload: Partial<BrandDto>) {
  return apiClient<BrandDto>(`/api/admin/brands/${id}`, {
    method: 'PUT',
    body: payload,
  });
}

export function deleteBrand(id: string) {
  return apiClient<void>(`/api/admin/brands/${id}`, {
    method: 'DELETE',
  });
}

// Products admin
export interface ListProductsParams {
  search?: string;
  status?: ProductStatus;
  categoryId?: string;
  brandId?: string;
  productKind?: ProductKind;
  page?: number;
  limit?: number;
}

export function listProducts(params: ListProductsParams = {}) {
  const query = new URLSearchParams();
  if (params.search) query.set('search', params.search);
  if (params.status) query.set('status', params.status);
  if (params.categoryId) query.set('categoryId', params.categoryId);
  if (params.brandId) query.set('brandId', params.brandId);
  if (params.productKind) query.set('productKind', params.productKind);
  if (params.page) query.set('page', String(params.page));
  if (params.limit) query.set('limit', String(params.limit));

  const suffix = query.toString() ? `?${query.toString()}` : '';
  return apiClient<ProductListResult>(`/api/admin/products${suffix}`);
}

export function getProduct(id: string) {
  return apiClient<ProductDto>(`/api/admin/products/${id}`);
}

export function createProduct(payload: Record<string, unknown>) {
  return apiClient<ProductDto>('/api/admin/products', {
    method: 'POST',
    body: payload,
  });
}

export function updateProduct(id: string, payload: Record<string, unknown>) {
  return apiClient<ProductDto>(`/api/admin/products/${id}`, {
    method: 'PUT',
    body: payload,
  });
}

export function deleteProduct(id: string) {
  return apiClient<void>(`/api/admin/products/${id}`, {
    method: 'DELETE',
  });
}

// Public
export interface PublicProductsParams {
  search?: string;
  category?: string;
  brand?: string;
  productKind?: ProductKind;
  featured?: boolean;
  minPrice?: number;
  maxPrice?: number;
  sort?: PublicProductSort;
  attrValues?: string[];
  page?: number;
  limit?: number;
}

export function listPublicProducts(params: PublicProductsParams = {}) {
  const query = new URLSearchParams();
  if (params.search) query.set('search', params.search);
  if (params.category) query.set('category', params.category);
  if (params.brand) query.set('brand', params.brand);
  if (params.productKind) query.set('productKind', params.productKind);
  if (params.featured) query.set('featured', 'true');
  if (params.minPrice !== undefined) query.set('minPrice', String(params.minPrice));
  if (params.maxPrice !== undefined) query.set('maxPrice', String(params.maxPrice));
  if (params.sort) query.set('sort', params.sort);
  if (params.attrValues?.length) {
    query.set('attrValues', params.attrValues.join(','));
  }
  if (params.page) query.set('page', String(params.page));
  if (params.limit) query.set('limit', String(params.limit));

  const suffix = query.toString() ? `?${query.toString()}` : '';
  return apiClient<PublicCatalogListResult<PublicProductDto>>(
    `/api/public/products${suffix}`,
    { auth: false },
  );
}

export function getPublicProduct(slug: string) {
  return apiClient<PublicProductDetailDto>(`/api/public/products/${slug}`, {
    auth: false,
  });
}

export function listPublicProductCategories(params: { limit?: number } = {}) {
  const query = new URLSearchParams();
  if (params.limit) query.set('limit', String(params.limit));

  const suffix = query.toString() ? `?${query.toString()}` : '';
  return apiClient<PublicProductCategoryDto[]>(
    `/api/public/categories${suffix}`,
    { auth: false },
  );
}

export function getPublicProductCategory(slug: string) {
  return apiClient<PublicProductCategoryDetailDto>(
    `/api/public/categories/${slug}`,
    { auth: false },
  );
}

export function getProductPublicPath(product: {
  slug: string;
  productKind: ProductKind;
}): string {
  return product.productKind === 'SOFTWARE'
    ? `/yazilim/${product.slug}`
    : `/urun/${product.slug}`;
}

export function getProductsIndexPath(productKind?: ProductKind): string {
  return productKind === 'SOFTWARE' ? '/yazilimlar' : '/urunler';
}

export const PRODUCT_ATTRIBUTE_TYPE_LABELS: Record<ProductAttributeType, string> = {
  TEXT: 'Metin',
  NUMBER: 'Sayı',
  SELECT: 'Seçim listesi',
  COLOR: 'Renk',
  BOOLEAN: 'Evet/Hayır',
};

// Product attributes admin
export function listProductAttributes() {
  return apiClient<ProductAttributeDto[]>('/api/admin/product-attributes');
}

export function getProductAttribute(id: string) {
  return apiClient<ProductAttributeDto>(`/api/admin/product-attributes/${id}`);
}

export function createProductAttribute(payload: {
  name: string;
  code?: string;
  type: ProductAttributeType;
  isFilterable?: boolean;
  isVariantOption?: boolean;
  sortOrder?: number;
}) {
  return apiClient<ProductAttributeDto>('/api/admin/product-attributes', {
    method: 'POST',
    body: payload,
  });
}

export function updateProductAttribute(
  id: string,
  payload: Partial<{
    name: string;
    code: string;
    type: ProductAttributeType;
    isFilterable: boolean;
    isVariantOption: boolean;
    sortOrder: number;
  }>,
) {
  return apiClient<ProductAttributeDto>(`/api/admin/product-attributes/${id}`, {
    method: 'PUT',
    body: payload,
  });
}

export function deleteProductAttribute(id: string) {
  return apiClient<void>(`/api/admin/product-attributes/${id}`, {
    method: 'DELETE',
  });
}

export function createProductAttributeValue(
  attributeId: string,
  payload: { value: string; colorHex?: string | null; sortOrder?: number },
) {
  return apiClient<ProductAttributeValueDto>(
    `/api/admin/product-attributes/${attributeId}/values`,
    { method: 'POST', body: payload },
  );
}

export function updateProductAttributeValue(
  attributeId: string,
  valueId: string,
  payload: Partial<{ value: string; colorHex: string | null; sortOrder: number }>,
) {
  return apiClient<ProductAttributeValueDto>(
    `/api/admin/product-attributes/${attributeId}/values/${valueId}`,
    { method: 'PUT', body: payload },
  );
}

export function deleteProductAttributeValue(
  attributeId: string,
  valueId: string,
) {
  return apiClient<void>(
    `/api/admin/product-attributes/${attributeId}/values/${valueId}`,
    { method: 'DELETE' },
  );
}

export function listProductAttributeAssignments(productId: string) {
  return apiClient<ProductAttributeAssignmentDto[]>(
    `/api/admin/products/${productId}/attribute-assignments`,
  );
}

export function saveProductAttributeAssignments(
  productId: string,
  assignments: Array<{
    attributeId: string;
    valueText?: string | null;
    valueNumber?: number | null;
    valueBoolean?: boolean | null;
    attributeValueId?: string | null;
  }>,
) {
  return apiClient<ProductAttributeAssignmentDto[]>(
    `/api/admin/products/${productId}/attribute-assignments`,
    { method: 'PUT', body: { assignments } },
  );
}

export function listProductVariants(productId: string) {
  return apiClient<ProductVariantDto[]>(
    `/api/admin/products/${productId}/variants`,
  );
}

export function createProductVariant(
  productId: string,
  payload: {
    sku?: string | null;
    barcode?: string | null;
    price?: number | null;
    salePrice?: number | null;
    stockQuantity?: number | null;
    imageId?: string | null;
    isActive?: boolean;
    options: Array<{ attributeId: string; attributeValueId: string }>;
  },
) {
  return apiClient<ProductVariantDto>(
    `/api/admin/products/${productId}/variants`,
    { method: 'POST', body: payload },
  );
}

export function updateProductVariant(
  productId: string,
  variantId: string,
  payload: Partial<{
    sku: string | null;
    barcode: string | null;
    price: number | null;
    salePrice: number | null;
    stockQuantity: number | null;
    imageId: string | null;
    isActive: boolean;
    options: Array<{ attributeId: string; attributeValueId: string }>;
  }>,
) {
  return apiClient<ProductVariantDto>(
    `/api/admin/products/${productId}/variants/${variantId}`,
    { method: 'PUT', body: payload },
  );
}

export function deleteProductVariant(productId: string, variantId: string) {
  return apiClient<void>(
    `/api/admin/products/${productId}/variants/${variantId}`,
    { method: 'DELETE' },
  );
}

export function generateProductVariants(
  productId: string,
  selections: Array<{ attributeId: string; valueIds: string[] }>,
) {
  return apiClient<GenerateVariantsResultDto>(
    `/api/admin/products/${productId}/variants/generate`,
    { method: 'POST', body: { selections } },
  );
}

export function listFilterableAttributes() {
  return apiClient<FilterableAttributeDto[]>('/api/public/filter-attributes', {
    auth: false,
  });
}

export function listPublicBrands() {
  return apiClient<PublicBrandSummaryDto[]>('/api/public/brands', {
    auth: false,
  });
}

export function getPublicBrand(slug: string) {
  return apiClient<PublicBrandDetailDto>(`/api/public/brands/${slug}`, {
    auth: false,
  });
}
