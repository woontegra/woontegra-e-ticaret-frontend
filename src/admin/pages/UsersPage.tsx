import { useMemo, useState } from 'react';
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
import { UserFormModal } from '@/admin/components/UserFormModal';
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

export function UsersPage() {
  const queryClient = useQueryClient();
  const currentUser = useAuthStore((state) => state.user);
  const canManage = canManageUsers(currentUser?.role);

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [activeFilter, setActiveFilter] = useState('');
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
    }),
    [search, roleFilter, activeFilter],
  );

  const usersQuery = useQuery({
    queryKey: ['users', queryParams],
    queryFn: () => listUsers(queryParams),
  });

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
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      updateUser(id, { isActive }),
    onSuccess: invalidateUsers,
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
      <Card padding="sm">
        <CardHeader
          title="Kullanıcılar"
          description="Admin panel kullanıcılarını yönetin"
          action={
            canManage ? (
              <Button size="sm" onClick={openCreate}>
                <Plus className="h-4 w-4" />
                Yeni kullanıcı
              </Button>
            ) : null
          }
        />

        <FilterBar searchValue={search} onSearchChange={setSearch}>
          <Select
            className="w-36"
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
            className="w-32"
            value={activeFilter}
            onChange={(event) => setActiveFilter(event.target.value)}
          >
            <option value="">Tümü</option>
            <option value="true">Aktif</option>
            <option value="false">Pasif</option>
          </Select>
        </FilterBar>

        {mutationError ? (
          <p className="mt-2 rounded-md bg-red-50 px-2 py-1.5 text-xs text-red-700">
            {mutationError}
          </p>
        ) : null}

        <div className="mt-3">
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>Kullanıcı</TableHeaderCell>
                <TableHeaderCell>E-posta</TableHeaderCell>
                <TableHeaderCell>Rol</TableHeaderCell>
                <TableHeaderCell>Durum</TableHeaderCell>
                <TableHeaderCell>Tenant</TableHeaderCell>
                {canManage ? (
                  <TableHeaderCell className="text-right">İşlem</TableHeaderCell>
                ) : null}
              </TableRow>
            </TableHead>
            <TableBody>
              {usersQuery.isLoading ? (
                <TableEmpty colSpan={canManage ? 6 : 5} message="Yükleniyor…" />
              ) : usersQuery.data?.length ? (
                usersQuery.data.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-slate-900">
                          {user.username}
                        </p>
                        {(user.firstName || user.lastName) && (
                          <p className="text-xs text-slate-500">
                            {[user.firstName, user.lastName]
                              .filter(Boolean)
                              .join(' ')}
                          </p>
                        )}
                      </div>
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
                      {user.tenant?.name ?? '—'}
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
                ))
              ) : (
                <TableEmpty colSpan={canManage ? 6 : 5} message="Kullanıcı bulunamadı" />
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      <UserFormModal
        isOpen={formModal.isOpen}
        onClose={formModal.close}
        user={selectedUser}
        onSubmit={handleFormSubmit}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      <Modal
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.close}
        title="Kullanıcıyı sil"
        description={
          userToDelete
            ? `${userToDelete.username} kalıcı olarak silinecek.`
            : undefined
        }
        footer={
          <>
            <Button variant="secondary" onClick={deleteModal.close}>
              İptal
            </Button>
            <Button
              variant="danger"
              isLoading={deleteMutation.isPending}
              onClick={() =>
                userToDelete && deleteMutation.mutate(userToDelete.id)
              }
            >
              Sil
            </Button>
          </>
        }
      >
        <p className="text-sm text-slate-600">
          Bu işlem geri alınamaz. Devam etmek istiyor musunuz?
        </p>
      </Modal>
    </div>
  );
}
