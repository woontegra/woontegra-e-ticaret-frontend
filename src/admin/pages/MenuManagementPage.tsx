import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ArrowDown,
  ArrowUp,
  ChevronRight,
  Pencil,
  Plus,
  Trash2,
} from 'lucide-react';
import type { MenuItemDto, MenuLocation } from '@/shared/types/api';
import {
  createMenuItem,
  deleteMenuItem,
  getMenuByLocation,
  listMenuItems,
  MENU_LOCATION_LABELS,
  reorderMenuItems,
  updateMenu,
  updateMenuItem,
} from '@/shared/api/menus.api';
import {
  MenuItemFormModal,
  type MenuItemFormValues,
} from '@/admin/components/MenuItemFormModal';
import { useDisclosure } from '@/shared/hooks/useDisclosure';
import {
  Badge,
  Button,
  Card,
  CardHeader,
  Modal,
} from '@/shared/ui';

const LOCATIONS: MenuLocation[] = ['HEADER', 'FOOTER', 'MOBILE'];

type FlatItem = MenuItemDto & { depth: number };

function flattenItems(items: MenuItemDto[], depth = 0): FlatItem[] {
  const result: FlatItem[] = [];

  for (const item of items) {
    result.push({ ...item, depth });
    if (item.children?.length) {
      result.push(...flattenItems(item.children, depth + 1));
    }
  }

  return result;
}

function collectReorderPayload(items: MenuItemDto[]) {
  const payload: Array<{ id: string; sortOrder: number; parentId: string | null }> =
    [];

  function walk(nodes: MenuItemDto[], parentId: string | null) {
    nodes.forEach((node, index) => {
      payload.push({ id: node.id, sortOrder: index, parentId });
      if (node.children?.length) {
        walk(node.children, node.id);
      }
    });
  }

  walk(items, null);
  return { items: payload };
}

export function MenuManagementPage() {
  const queryClient = useQueryClient();
  const [location, setLocation] = useState<MenuLocation>('HEADER');
  const [selectedItem, setSelectedItem] = useState<MenuItemDto | null>(null);
  const [parentForNew, setParentForNew] = useState<string | null>(null);
  const [itemToDelete, setItemToDelete] = useState<MenuItemDto | null>(null);

  const formModal = useDisclosure();
  const deleteModal = useDisclosure();

  const menuQuery = useQuery({
    queryKey: ['admin', 'menus', location],
    queryFn: () => getMenuByLocation(location),
  });

  const itemsQuery = useQuery({
    queryKey: ['admin', 'menus', menuQuery.data?.id, 'items'],
    queryFn: () => listMenuItems(menuQuery.data!.id),
    enabled: Boolean(menuQuery.data?.id),
  });

  const flatItems = useMemo(
    () => flattenItems(itemsQuery.data ?? []),
    [itemsQuery.data],
  );

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['admin', 'menus'] });
    queryClient.invalidateQueries({ queryKey: ['public', 'menus'] });
  };

  const toggleMenuMutation = useMutation({
    mutationFn: () =>
      updateMenu(menuQuery.data!.id, {
        isActive: !menuQuery.data!.isActive,
      }),
    onSuccess: invalidate,
  });

  const saveItemMutation = useMutation({
    mutationFn: (values: MenuItemFormValues) => {
      const payload = {
        label: values.label,
        type: values.type,
        targetId: values.targetId || null,
        url: values.type === 'CUSTOM_URL' ? values.url : null,
        openInNewTab: values.openInNewTab,
        isActive: values.isActive,
      };

      if (selectedItem) {
        return updateMenuItem(selectedItem.id, payload);
      }

      return createMenuItem(menuQuery.data!.id, {
        ...payload,
        parentId: parentForNew,
      });
    },
    onSuccess: () => {
      invalidate();
      formModal.close();
      setSelectedItem(null);
      setParentForNew(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteMenuItem(itemToDelete!.id),
    onSuccess: () => {
      invalidate();
      deleteModal.close();
      setItemToDelete(null);
    },
  });

  const reorderMutation = useMutation({
    mutationFn: (items: MenuItemDto[]) =>
      reorderMenuItems(menuQuery.data!.id, collectReorderPayload(items)),
    onSuccess: invalidate,
  });

  const openCreate = (parentId: string | null = null) => {
    setSelectedItem(null);
    setParentForNew(parentId);
    formModal.open();
  };

  const openEdit = (item: MenuItemDto) => {
    setSelectedItem(item);
    setParentForNew(null);
    formModal.open();
  };

  const moveItem = (item: MenuItemDto, direction: 'up' | 'down') => {
    const tree = structuredClone(itemsQuery.data ?? []) as MenuItemDto[];

    function findSiblings(
      nodes: MenuItemDto[],
      parentId: string | null,
    ): MenuItemDto[] | null {
      if (parentId === null) return nodes;

      for (const node of nodes) {
        if (node.id === parentId) return node.children ?? [];
        if (node.children?.length) {
          const found = findSiblings(node.children, parentId);
          if (found) return found;
        }
      }

      return null;
    }

    const siblings = findSiblings(tree, item.parentId) ?? tree;
    const index = siblings.findIndex((sibling) => sibling.id === item.id);
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= siblings.length) return;

    [siblings[index], siblings[targetIndex]] = [
      siblings[targetIndex],
      siblings[index],
    ];

    reorderMutation.mutate(tree);
  };

  return (
    <>
      <Card padding="sm">
        <CardHeader
          title="Menü Yönetimi"
          description="Header, footer ve mobil menüleri düzenleyin"
          action={
            menuQuery.data ? (
              <Button
                size="sm"
                variant="secondary"
                isLoading={toggleMenuMutation.isPending}
                onClick={() => toggleMenuMutation.mutate()}
              >
                {menuQuery.data.isActive ? 'Menüyü pasifleştir' : 'Menüyü aktifleştir'}
              </Button>
            ) : null
          }
        />

        <div className="mb-4 flex flex-wrap gap-2">
          {LOCATIONS.map((loc) => (
            <Button
              key={loc}
              size="sm"
              variant={location === loc ? 'primary' : 'secondary'}
              onClick={() => setLocation(loc)}
            >
              {MENU_LOCATION_LABELS[loc]}
            </Button>
          ))}
        </div>

        {menuQuery.data ? (
          <div className="mb-4 flex items-center gap-2">
            <Badge variant={menuQuery.data.isActive ? 'success' : 'default'}>
              {menuQuery.data.isActive ? 'Aktif' : 'Pasif'}
            </Badge>
            <span className="text-sm text-slate-600">{menuQuery.data.name}</span>
          </div>
        ) : null}

        <div className="mb-3 flex justify-end">
          <Button size="sm" onClick={() => openCreate(null)}>
            <Plus className="h-4 w-4" />
            Menü öğesi ekle
          </Button>
        </div>

        {itemsQuery.isLoading ? (
          <p className="text-sm text-slate-500">Yükleniyor…</p>
        ) : flatItems.length === 0 ? (
          <p className="rounded-lg border border-dashed border-slate-200 py-10 text-center text-sm text-slate-500">
            Bu menüde henüz öğe yok.
          </p>
        ) : (
          <ul className="divide-y divide-slate-100 rounded-lg border border-slate-200">
            {flatItems.map((item) => (
              <li
                key={item.id}
                className="flex flex-wrap items-center gap-2 px-3 py-2.5"
                style={{ paddingLeft: `${12 + item.depth * 20}px` }}
              >
                {item.depth > 0 ? (
                  <ChevronRight className="h-3 w-3 text-slate-300" />
                ) : null}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-900">{item.label}</p>
                  <p className="text-xs text-slate-500">
                    {item.href ?? '—'} {!item.isActive ? '· pasif' : ''}
                  </p>
                </div>
                <div className="flex flex-wrap gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => moveItem(item, 'up')}
                    disabled={reorderMutation.isPending}
                  >
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => moveItem(item, 'down')}
                    disabled={reorderMutation.isPending}
                  >
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => openCreate(item.id)}>
                    Alt öğe
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => openEdit(item)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setItemToDelete(item);
                      deleteModal.open();
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <MenuItemFormModal
        isOpen={formModal.isOpen}
        onClose={formModal.close}
        title={selectedItem ? 'Menü öğesi düzenle' : 'Menü öğesi ekle'}
        initial={selectedItem}
        isLoading={saveItemMutation.isPending}
        onSubmit={(values) => saveItemMutation.mutate(values)}
      />

      <Modal
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.close}
        title="Menü öğesini sil"
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={deleteModal.close}>
              İptal
            </Button>
            <Button
              variant="danger"
              isLoading={deleteMutation.isPending}
              onClick={() => deleteMutation.mutate()}
            >
              Sil
            </Button>
          </>
        }
      >
        <p className="text-sm text-slate-600">
          <strong>{itemToDelete?.label}</strong> ve alt öğeleri silinecek.
        </p>
      </Modal>
    </>
  );
}
