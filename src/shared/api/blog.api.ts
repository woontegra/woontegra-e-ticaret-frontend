import type {
  BlogCategoryDto,
  BlogPostDto,
  BlogPostListResult,
  PageStatus,
} from '@/shared/types/api';
import { apiClient } from './client';

export interface BlogPostListParams {
  search?: string;
  status?: PageStatus;
  categoryId?: string;
  page?: number;
  limit?: number;
}

export interface PublicBlogListParams {
  search?: string;
  category?: string;
  page?: number;
  limit?: number;
}

export interface SaveBlogCategoryPayload {
  name?: string;
  slug?: string;
  description?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  isActive?: boolean;
}

export interface SaveBlogPostPayload {
  title?: string;
  slug?: string;
  excerpt?: string | null;
  contentHtml?: string;
  coverImageId?: string | null;
  categoryId?: string | null;
  status?: PageStatus;
  authorName?: string | null;
  readingTime?: number | null;
  tags?: string[];
  seoTitle?: string | null;
  seoDescription?: string | null;
  ogImageId?: string | null;
  robotsIndex?: boolean;
}

export function listBlogCategories() {
  return apiClient<BlogCategoryDto[]>('/api/admin/blog/categories');
}

export function getBlogCategory(id: string) {
  return apiClient<BlogCategoryDto>(`/api/admin/blog/categories/${id}`);
}

export function createBlogCategory(payload: SaveBlogCategoryPayload) {
  return apiClient<BlogCategoryDto>('/api/admin/blog/categories', {
    method: 'POST',
    body: payload,
  });
}

export function updateBlogCategory(id: string, payload: SaveBlogCategoryPayload) {
  return apiClient<BlogCategoryDto>(`/api/admin/blog/categories/${id}`, {
    method: 'PUT',
    body: payload,
  });
}

export function deleteBlogCategory(id: string) {
  return apiClient<void>(`/api/admin/blog/categories/${id}`, {
    method: 'DELETE',
  });
}

export function listBlogPosts(params: BlogPostListParams = {}) {
  const query = new URLSearchParams();
  if (params.search) query.set('search', params.search);
  if (params.status) query.set('status', params.status);
  if (params.categoryId) query.set('categoryId', params.categoryId);
  if (params.page) query.set('page', String(params.page));
  if (params.limit) query.set('limit', String(params.limit));

  const suffix = query.toString() ? `?${query.toString()}` : '';
  return apiClient<BlogPostListResult>(`/api/admin/blog/posts${suffix}`);
}

export function getBlogPost(id: string) {
  return apiClient<BlogPostDto>(`/api/admin/blog/posts/${id}`);
}

export function createBlogPost(payload: SaveBlogPostPayload) {
  return apiClient<BlogPostDto>('/api/admin/blog/posts', {
    method: 'POST',
    body: payload,
  });
}

export function updateBlogPost(id: string, payload: SaveBlogPostPayload) {
  return apiClient<BlogPostDto>(`/api/admin/blog/posts/${id}`, {
    method: 'PUT',
    body: payload,
  });
}

export function deleteBlogPost(id: string) {
  return apiClient<void>(`/api/admin/blog/posts/${id}`, { method: 'DELETE' });
}

export function publishBlogPost(id: string) {
  return apiClient<BlogPostDto>(`/api/admin/blog/posts/${id}/publish`, {
    method: 'POST',
  });
}

export function unpublishBlogPost(id: string) {
  return apiClient<BlogPostDto>(`/api/admin/blog/posts/${id}/unpublish`, {
    method: 'POST',
  });
}

export function listPublicBlogCategories() {
  return apiClient<BlogCategoryDto[]>('/api/public/blog/categories', {
    auth: false,
  });
}

export function listPublicBlogPosts(params: PublicBlogListParams = {}) {
  const query = new URLSearchParams();
  if (params.search) query.set('search', params.search);
  if (params.category) query.set('category', params.category);
  if (params.page) query.set('page', String(params.page));
  if (params.limit) query.set('limit', String(params.limit));

  const suffix = query.toString() ? `?${query.toString()}` : '';
  return apiClient<BlogPostListResult>(`/api/public/blog/posts${suffix}`, {
    auth: false,
  });
}

export function getPublicBlogPost(slug: string) {
  return apiClient<BlogPostDto>(`/api/public/blog/posts/${slug}`, {
    auth: false,
  });
}

export const BLOG_STATUS_LABELS: Record<PageStatus, string> = {
  DRAFT: 'Taslak',
  PUBLISHED: 'Yayında',
};

export function slugifyClient(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120);
}
