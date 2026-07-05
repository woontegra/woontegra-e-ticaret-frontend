import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Pencil, Plus, Trash2, UserX } from 'lucide-react';
import type { AuthUser } from '@/shared/api/auth.api';
import { ApiError } from '@/shared/api/client';
import {
  createUser,
  deleteUser,
  listUsers,
  updateUser,
  type CreateUserPayload,
} from '@/shared/api/users.api';
import { AdminPanel } from '@/admin/components/AdminPanel';
import { TableQueryState } from '@/admin/components/TableQueryState';
import { UserFormModal } from '@/admin/components/UserFormModal';
import { useAdminMutationFeedback } from '@/admin/hooks/useAdminMutationFeedback';
import {
  canManageUsers,
  USER_ROLE_LABELS,
  type UserRole,
} from '@/shared/auth/roles';
import { useAuthStore } from '@/shared/auth/auth.store';
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

export function UsersPage() {
  const queryClient = useQueryClient();
  const currentUser = useAuthStore((state) => state.user);
  const canManage = canManageUsers(currentUser?.role);
  const { onSuccess, onError } = useAdminMutationFeedback();

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [activeFilter, setActiveFilter] = useState('');
  const [page, setPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<AuthUser | null>(null);
  const [userToDelete, setUserToDelete] = useState<AuthUser | null>(null);

  const formModal = useDisclosure();
  const deleteModal = useDisclosure();

  const queryParams = useMemo(
    () => ({
      search: search || undefined,
      role: roleFilter || undefined,
      isActive:
        activeFilter === ''
          ? undefined
          : activeFilter === 'true',
      page,
      limit: PAGE_SIZE,
    }),
    [search, roleFilter, activeFilter, page],
  );

  const usersQuery = useQuery({
    queryKey: ['users', queryParams],
    queryFn: () => listUsers(queryParams),
  });

  const items = usersQuery.data?.items ?? [];
  const total = usersQuery.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const colSpan = canManage ? 6 : 5;

  useEffect(() => {
    setPage(1);
  }, [search, roleFilter, activeFilter]);

  const invalidateUsers = () =>
    queryClient.invalidateQueries({ queryKey: ['users'] });

  const createMutation = useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      invalidateUsers();
      formModal.close();
      setSelectedUser(null);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: Record<string, unknown>;
    }) => updateUser(id, payload),
    onSuccess: () => {
      invalidateUsers();
      formModal.close();
      setSelectedUser(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      invalidateUsers();
      deleteModal.close();
      setUserToDelete(null);
      onSuccess('Kullanıcı silindi.');
    },
    onError: (error) => onError(error, 'Kullanıcı silinemedi.'),
  });

  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      updateUser(id, { isActive }),
    onSuccess: () => {
      invalidateUsers();
      onSuccess('Kullanıcı durumu güncellendi.');
    },
    onError: (error) => onError(error, 'Durum güncellenemedi.'),
  });

  const openCreate = () => {
    setSelectedUser(null);
    formModal.open();
  };

  const openEdit = (user: AuthUser) => {
    setSelectedUser(user);
    formModal.open();
  };

  const openDelete = (user: AuthUser) => {
    setUserToDelete(user);
    deleteModal.open();
  };

  const handleFormSubmit = (payload: Record<string, unknown>) => {
    if (selectedUser) {
      updateMutation.mutate({ id: selectedUser.id, payload });
      return;
    }
    createMutation.mutate(payload as unknown as CreateUserPayload);
  };

  const mutationError =
    createMutation.error instanceof ApiError
      ? createMutation.error.message
      : updateMutation.error instanceof ApiError
        ? updateMutation.error.message
        : null;

  return (
    <div className="space-y-3">
      <AdminPanel
        actions={
          canManage ? (
            <Button size="sm" onClick={openCreate}>
              <Plus className="h-4 w-4" />
              Yeni kullanıcı
            </Button>
          ) : undefined
        }
        filters={
          <FilterBar
            searchValue={search}
            onSearchChange={setSearch}
            searchPlaceholder="Ad veya e-posta ara…"
          >
            <Select
              className="h-8 text-xs"
              value={roleFilter}
              onChange={(event) => setRoleFilter(event.target.value)}
            >
              <option value="">Tüm roller</option>
              {Object.entries(USER_ROLE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
            <Select
              className="h-8 text-xs"
              value={activeFilter}
              onChange={(event) => setActiveFilter(event.target.value)}
            >
              <option value="">Tümü</option>
              <option value="true">Aktif</option>
              <option value="false">Pasif</option>
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
        {mutationError ? (
          <p className="border-b border-slate-100 px-3 py-2 text-xs text-red-700">
            {mutationError}
          </p>
        ) : null}
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>Ad</TableHeaderCell>
              <TableHeaderCell>E-posta</TableHeaderCell>
              <TableHeaderCell>Rol</TableHeaderCell>
              <TableHeaderCell>Durum</TableHeaderCell>
              <TableHeaderCell>Son giriş</TableHeaderCell>
              {canManage ? (
                <TableHeaderCell className="text-right">İşlem</TableHeaderCell>
              ) : null}
            </TableRow>
          </TableHead>
          <TableBody>
            <TableQueryState
              colSpan={colSpan}
              isLoading={usersQuery.isLoading}
              isError={usersQuery.isError}
              isEmpty={items.length === 0}
              emptyMessage="Kullanıcı bulunamadı"
            >
              {items.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium text-slate-900">
                    {user.name}
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge>
                      {USER_ROLE_LABELS[user.role as UserRole] ?? user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.isActive ? 'success' : 'danger'}>
                      {user.isActive ? 'Aktif' : 'Pasif'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-slate-500">
                    {user.lastLoginAt
                      ? new Date(user.lastLoginAt).toLocaleString('tr-TR')
                      : '—'}
                  </TableCell>
                  {canManage ? (
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEdit(user)}
                          aria-label="Düzenle"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            toggleActiveMutation.mutate({
                              id: user.id,
                              isActive: !user.isActive,
                            })
                          }
                          aria-label={
                            user.isActive ? 'Pasifleştir' : 'Aktifleştir'
                          }
                        >
                          <UserX className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openDelete(user)}
                          disabled={user.id === currentUser?.id}
                          aria-label="Sil"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  ) : null}
                </TableRow>
              ))}
            </TableQueryState>
          </TableBody>
        </Table>
      </AdminPanel>

      <UserFormModal
        isOpen={formModal.isOpen}
        onClose={formModal.close}
        user={selectedUser}
        onSubmit={handleFormSubmit}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      <ConfirmDialog
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.close}
        title="Kullanıcıyı sil"
        description={
          userToDelete
            ? `${userToDelete.name} kalıcı olarak silinecek. Bu işlem geri alınamaz.`
            : 'Bu kullanıcı kalıcı olarak silinecek.'
        }
        confirmLabel="Sil"
        isLoading={deleteMutation.isPending}
        onConfirm={() =>
          userToDelete && deleteMutation.mutate(userToDelete.id)
        }
      />
    </div>
  );
}
