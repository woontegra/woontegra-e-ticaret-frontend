import type {
  ContactMessageDto,
  ContactMessageListResult,
  ContactMessageStatus,
  FormDefinitionDto,
  FormDefinitionPublicDto,
  FormSubmissionDto,
  FormSubmissionStatus,
  SubmitContactInput,
} from '@/shared/types/api';
import { apiClient } from './client';

export function submitContact(payload: SubmitContactInput) {
  return apiClient<ContactMessageDto>('/api/public/contact', {
    method: 'POST',
    body: payload,
    auth: false,
  });
}

export function getPublicForm(key: string) {
  return apiClient<FormDefinitionPublicDto>(`/api/public/contact/forms/${key}`, {
    auth: false,
  });
}

export function submitPublicForm(key: string, data: Record<string, unknown>) {
  return apiClient<{ id: string }>(`/api/public/contact/forms/${key}/submit`, {
    method: 'POST',
    body: { data },
    auth: false,
  });
}

export function listContactMessages(params: {
  status?: ContactMessageStatus;
  search?: string;
  page?: number;
  limit?: number;
} = {}) {
  const query = new URLSearchParams();
  if (params.status) query.set('status', params.status);
  if (params.search) query.set('search', params.search);
  if (params.page) query.set('page', String(params.page));
  if (params.limit) query.set('limit', String(params.limit));
  const suffix = query.toString() ? `?${query.toString()}` : '';
  return apiClient<ContactMessageListResult>(
    `/api/admin/contact-messages${suffix}`,
  );
}

export function getContactMessage(id: string) {
  return apiClient<ContactMessageDto>(`/api/admin/contact-messages/${id}`);
}

export function updateContactMessageStatus(
  id: string,
  status: ContactMessageStatus,
) {
  return apiClient<ContactMessageDto>(
    `/api/admin/contact-messages/${id}/status`,
    { method: 'PATCH', body: { status } },
  );
}

export function updateContactMessageNote(id: string, note: string | null) {
  return apiClient<ContactMessageDto>(`/api/admin/contact-messages/${id}/note`, {
    method: 'PATCH',
    body: { note },
  });
}

export function replyContactMessage(id: string, replyMessage: string) {
  return apiClient<{
    message: ContactMessageDto;
    mail: { sent: boolean; error?: string };
  }>(`/api/admin/contact-messages/${id}/reply`, {
    method: 'POST',
    body: { replyMessage },
  });
}

export function listFormDefinitions() {
  return apiClient<FormDefinitionDto[]>('/api/admin/form-definitions');
}

export function createFormDefinition(input: {
  name: string;
  key: string;
  fields: FormDefinitionDto['fields'];
  isActive?: boolean;
}) {
  return apiClient<FormDefinitionDto>('/api/admin/form-definitions', {
    method: 'POST',
    body: input,
  });
}

export function updateFormDefinition(
  id: string,
  input: Partial<{
    name: string;
    key: string;
    fields: FormDefinitionDto['fields'];
    isActive: boolean;
  }>,
) {
  return apiClient<FormDefinitionDto>(`/api/admin/form-definitions/${id}`, {
    method: 'PUT',
    body: input,
  });
}

export function deleteFormDefinition(id: string) {
  return apiClient<{ ok: true }>(`/api/admin/form-definitions/${id}`, {
    method: 'DELETE',
  });
}

export function listFormSubmissions(formId?: string) {
  const suffix = formId ? `?formId=${formId}` : '';
  return apiClient<FormSubmissionDto[]>(
    `/api/admin/form-submissions${suffix}`,
  );
}

export function updateFormSubmissionStatus(
  id: string,
  status: FormSubmissionStatus,
) {
  return apiClient<FormSubmissionDto>(`/api/admin/form-submissions/${id}/status`, {
    method: 'PATCH',
    body: { status },
  });
}

export const CONTACT_MESSAGE_STATUS_LABELS: Record<
  ContactMessageStatus,
  string
> = {
  NEW: 'Yeni',
  READ: 'Okundu',
  REPLIED: 'Yanıtlandı',
  CLOSED: 'Kapatıldı',
};

export const FORM_SUBMISSION_STATUS_LABELS: Record<
  FormSubmissionStatus,
  string
> = {
  NEW: 'Yeni',
  READ: 'Okundu',
  CLOSED: 'Kapatıldı',
};

export const FORM_FIELD_TYPE_LABELS = {
  text: 'Metin',
  email: 'E-posta',
  tel: 'Telefon',
  textarea: 'Uzun metin',
  select: 'Seçim',
} as const;
