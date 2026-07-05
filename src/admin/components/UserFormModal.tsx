import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import type { AuthUser } from '@/shared/api/auth.api';
import {
  assignableRoles,
  USER_ROLE_LABELS,
  type UserRole,
} from '@/shared/auth/roles';
import { useAuthStore } from '@/shared/auth/auth.store';
import { Button, Input, Label, Modal, Select } from '@/shared/ui';

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: Record<string, unknown>) => void;
  isLoading?: boolean;
  user?: AuthUser | null;
}

const emptyForm = {
  name: '',
  email: '',
  password: '',
  role: 'STAFF' as UserRole,
  isActive: true,
};

export function UserFormModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  user,
}: UserFormModalProps) {
  const actor = useAuthStore((state) => state.user);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (!isOpen) return;

    if (user) {
      setForm({
        name: user.name,
        email: user.email,
        password: '',
        role: user.role as UserRole,
        isActive: user.isActive ?? true,
      });
      return;
    }

    setForm(emptyForm);
  }, [isOpen, user]);

  const roles = assignableRoles(actor?.role);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();

    const payload: Record<string, unknown> = {
      name: form.name,
      email: form.email,
      role: form.role,
      isActive: form.isActive,
    };

    if (form.password) {
      payload.password = form.password;
    }

    onSubmit(payload);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={user ? 'Kullanıcı düzenle' : 'Yeni kullanıcı'}
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            İptal
          </Button>
          <Button type="submit" form="user-form" isLoading={isLoading}>
            {user ? 'Kaydet' : 'Oluştur'}
          </Button>
        </>
      }
    >
      <form id="user-form" onSubmit={handleSubmit} className="space-y-3">
        <div>
          <Label htmlFor="name" required>
            Ad
          </Label>
          <Input
            id="name"
            value={form.name}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, name: event.target.value }))
            }
            required
          />
        </div>

        <div>
          <Label htmlFor="email" required>
            E-posta
          </Label>
          <Input
            id="email"
            type="email"
            value={form.email}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, email: event.target.value }))
            }
            required
          />
        </div>

        <div>
          <Label htmlFor="password" required={!user}>
            Şifre
          </Label>
          <Input
            id="password"
            type="password"
            value={form.password}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, password: event.target.value }))
            }
            placeholder={user ? 'Değiştirmek için doldurun' : ''}
            required={!user}
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label htmlFor="role" required>
              Rol
            </Label>
            <Select
              id="role"
              value={form.role}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  role: event.target.value as UserRole,
                }))
              }
            >
              {roles.map((role) => (
                <option key={role} value={role}>
                  {USER_ROLE_LABELS[role]}
                </option>
              ))}
            </Select>
          </div>
          <div className="flex items-end">
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    isActive: event.target.checked,
                  }))
                }
                className="rounded border-slate-300"
              />
              Aktif kullanıcı
            </label>
          </div>
        </div>
      </form>
    </Modal>
  );
}
