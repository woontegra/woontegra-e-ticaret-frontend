import { useState, type FormEvent } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import type { FormFieldDefinitionDto } from '@/shared/types/api';
import { ApiError } from '@/shared/api/client';
import {
  getPublicForm,
  submitContact,
  submitPublicForm,
} from '@/shared/api/contact.api';
import { Button, Input, Label, Select, Textarea } from '@/shared/ui';

interface ContactFormProps {
  formKey?: string | null;
  source?: string;
  title?: string;
  description?: string;
  className?: string;
}

export function ContactForm({
  formKey,
  source = 'contact_page',
  title,
  description,
  className,
}: ContactFormProps) {
  const [standardForm, setStandardForm] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [dynamicValues, setDynamicValues] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const formQuery = useQuery({
    queryKey: ['public', 'forms', formKey],
    queryFn: () => getPublicForm(formKey!),
    enabled: Boolean(formKey),
  });

  const submitMutation = useMutation({
    mutationFn: async () => {
      if (formKey && formQuery.data) {
        return submitPublicForm(formKey, dynamicValues);
      }
      return submitContact({
        name: standardForm.name.trim(),
        email: standardForm.email.trim(),
        phone: standardForm.phone.trim() || null,
        subject: standardForm.subject.trim() || null,
        message: standardForm.message.trim(),
        source,
      });
    },
    onSuccess: () => {
      setSubmitted(true);
      setErrorMessage(null);
    },
    onError: (error) => {
      setErrorMessage(
        error instanceof ApiError ? error.message : 'Gönderim başarısız',
      );
    },
  });

  const handleStandardSubmit = (event: FormEvent) => {
    event.preventDefault();
    submitMutation.mutate();
  };

  const handleDynamicSubmit = (event: FormEvent) => {
    event.preventDefault();
    submitMutation.mutate();
  };

  if (formKey && formQuery.isLoading) {
    return <p className="text-sm text-theme-muted">Form yükleniyor…</p>;
  }

  if (formKey && formQuery.isError) {
    return (
      <p className="text-sm text-red-600">
        Form bulunamadı veya pasif. Lütfen yönetici ile iletişime geçin.
      </p>
    );
  }

  const fields = formKey ? (formQuery.data?.fields ?? []) : null;
  const displayTitle = title ?? formQuery.data?.name;

  return (
    <div className={className}>
      {displayTitle ? (
        <h2 className="theme-heading mb-2 text-xl">{displayTitle}</h2>
      ) : null}
      {description ? (
        <p className="mb-4 text-sm text-theme-muted">{description}</p>
      ) : null}

      {submitted ? (
        <p className="text-sm text-theme-muted">
          Mesajınız alındı. En kısa sürede size dönüş yapılacaktır.
        </p>
      ) : fields ? (
        <form className="space-y-3" onSubmit={handleDynamicSubmit}>
          {fields.map((field) => (
            <DynamicField
              key={field.name}
              field={field}
              value={dynamicValues[field.name] ?? ''}
              onChange={(value) =>
                setDynamicValues((prev) => ({ ...prev, [field.name]: value }))
              }
            />
          ))}
          {errorMessage ? (
            <p className="text-sm text-red-600">{errorMessage}</p>
          ) : null}
          <Button type="submit" disabled={submitMutation.isPending}>
            {submitMutation.isPending ? 'Gönderiliyor…' : 'Gönder'}
          </Button>
        </form>
      ) : (
        <form className="space-y-3" onSubmit={handleStandardSubmit}>
          <div>
            <Label htmlFor="contact-name">Ad Soyad</Label>
            <Input
              id="contact-name"
              required
              value={standardForm.name}
              onChange={(e) =>
                setStandardForm((p) => ({ ...p, name: e.target.value }))
              }
            />
          </div>
          <div>
            <Label htmlFor="contact-email">E-posta</Label>
            <Input
              id="contact-email"
              type="email"
              required
              value={standardForm.email}
              onChange={(e) =>
                setStandardForm((p) => ({ ...p, email: e.target.value }))
              }
            />
          </div>
          <div>
            <Label htmlFor="contact-phone">Telefon (opsiyonel)</Label>
            <Input
              id="contact-phone"
              value={standardForm.phone}
              onChange={(e) =>
                setStandardForm((p) => ({ ...p, phone: e.target.value }))
              }
            />
          </div>
          <div>
            <Label htmlFor="contact-subject">Konu (opsiyonel)</Label>
            <Input
              id="contact-subject"
              value={standardForm.subject}
              onChange={(e) =>
                setStandardForm((p) => ({ ...p, subject: e.target.value }))
              }
            />
          </div>
          <div>
            <Label htmlFor="contact-message">Mesaj</Label>
            <Textarea
              id="contact-message"
              required
              rows={5}
              value={standardForm.message}
              onChange={(e) =>
                setStandardForm((p) => ({ ...p, message: e.target.value }))
              }
            />
          </div>
          {errorMessage ? (
            <p className="text-sm text-red-600">{errorMessage}</p>
          ) : null}
          <Button type="submit" disabled={submitMutation.isPending}>
            {submitMutation.isPending ? 'Gönderiliyor…' : 'Gönder'}
          </Button>
        </form>
      )}
    </div>
  );
}

function DynamicField({
  field,
  value,
  onChange,
}: {
  field: FormFieldDefinitionDto;
  value: string;
  onChange: (value: string) => void;
}) {
  const id = `field-${field.name}`;

  if (field.type === 'textarea') {
    return (
      <div>
        <Label htmlFor={id}>{field.label}</Label>
        <Textarea
          id={id}
          required={field.required}
          rows={4}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    );
  }

  if (field.type === 'select') {
    return (
      <div>
        <Label htmlFor={id}>{field.label}</Label>
        <Select
          id={id}
          required={field.required}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="">Seçin…</option>
          {(field.options ?? []).map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </Select>
      </div>
    );
  }

  return (
    <div>
      <Label htmlFor={id}>{field.label}</Label>
      <Input
        id={id}
        type={field.type === 'email' ? 'email' : field.type === 'tel' ? 'tel' : 'text'}
        required={field.required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
