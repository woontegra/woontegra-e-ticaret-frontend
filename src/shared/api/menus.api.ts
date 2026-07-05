import type {
  MenuDto,
  MenuItemDto,
  MenuItemType,
  MenuLocation,
  PublicMenusDto,
  ReorderMenuItemsInput,
} from '@/shared/types/api';
import { apiClient } from './client';

export interface SaveMenuItemPayload {
  parentId?: string | null;
  label?: string;
  type?: MenuItemType;
  targetId?: string | null;
  url?: string | null;
  openInNewTab?: boolean;
  sortOrder?: number;
  isActive?: boolean;
}

export function listMenus() {
  return apiClient<MenuDto[]>('/api/admin/menus');
}

export function getMenuByLocation(location: MenuLocation) {
  return apiClient<MenuDto>(`/api/admin/menus/location/${location}`);
}

export function updateMenu(id: string, payload: Partial<MenuDto>) {
  return apiClient<MenuDto>(`/api/admin/menus/${id}`, {
    method: 'PUT',
    body: payload,
  });
}

export function listMenuItems(menuId: string) {
  return apiClient<MenuItemDto[]>(`/api/admin/menus/${menuId}/items`);
}

export function createMenuItem(menuId: string, payload: SaveMenuItemPayload) {
  return apiClient<MenuItemDto>(`/api/admin/menus/${menuId}/items`, {
    method: 'POST',
    body: payload,
  });
}

export function updateMenuItem(id: string, payload: SaveMenuItemPayload) {
  return apiClient<MenuItemDto>(`/api/admin/menu-items/${id}`, {
    method: 'PUT',
    body: payload,
  });
}

export function deleteMenuItem(id: string) {
  return apiClient<void>(`/api/admin/menu-items/${id}`, { method: 'DELETE' });
}

export function reorderMenuItems(menuId: string, payload: ReorderMenuItemsInput) {
  return apiClient<MenuItemDto[]>(`/api/admin/menus/${menuId}/items/reorder`, {
    method: 'PUT',
    body: payload,
  });
}

export function getPublicMenus() {
  return apiClient<PublicMenusDto>('/api/public/menus', { auth: false });
}

export const MENU_LOCATION_LABELS: Record<MenuLocation, string> = {
  HEADER: 'Header',
  FOOTER: 'Footer',
  MOBILE: 'Mobil',
};

export const MENU_ITEM_TYPE_LABELS: Record<MenuItemType, string> = {
  PAGE: 'Sayfa',
  CATEGORY: 'Blog kategorisi',
  PRODUCT_CATEGORY: 'Ürün kategorisi',
  PRODUCT: 'Ürün',
  BLOG: 'Blog yazısı',
  CUSTOM_URL: 'Özel URL',
};
