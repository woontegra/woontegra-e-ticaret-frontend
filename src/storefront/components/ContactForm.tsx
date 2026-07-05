import { useState, useEffect, type FormEvent } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import type { FormFieldDefinitionDto } from '@/shared/types/api';
import { ApiError } from '@/shared/api/client';
import {
  getPublicForm,
  submitPublicForm,
} from '@/shared/api/contact.api';
import { uiLabel } from '@/shared/lib/storefront-ui';
import { Button, Input, Label, Select, Textarea } from '@/shared/ui';
import { useStorefrontUi } from '@/storefront/hooks/useStorefrontUi';

interface ContactFormProps {
  formKey?: string | null;
  title?: string;
  description?: string;
  className?: string;
  initialValues?: Record<string, string>;
}

export function ContactForm({
  formKey,
  title,
  description,
  className,
  initialValues = {},
}: ContactFormProps) {
  const ui = useStorefrontUi();
  const [dynamicValues, setDynamicValues] = useState<Record<string, string>>(
    () => ({ ...initialValues }),
  );
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const resolvedFormKey = formKey?.trim() || null;

  const formQuery = useQuery({
    queryKey: ['public', 'forms', resolvedFormKey],
    queryFn: () => getPublicForm(resolvedFormKey!),
    enabled: Boolean(resolvedFormKey),
  });

  useEffect(() => {
    if (!formQuery.data?.fields.length) return;
    const next: Record<string, string> = {};
    for (const field of formQuery.data.fields) {
      const value = resolveContactInitialValue(field, initialValues);
      if (value) next[field.name] = value;
    }
    if (Object.keys(next).length > 0) {
      setDynamicValues((prev) => ({ ...prev, ...next }));
    }
  }, [formQuery.data, initialValues]);

  const submitMutation = useMutation({
    mutationFn: async () => {
      if (!resolvedFormKey || !formQuery.data) {
        throw new Error('Form not configured');
      }
      return submitPublicForm(resolvedFormKey, dynamicValues);
    },
    onSuccess: () => {
      setSubmitted(true);
      setErrorMessage(null);
    },
    onError: (error) => {
      setErrorMessage(
        error instanceof ApiError
          ? error.message
          : uiLabel(ui, 'contactFormError') ?? '',
      );
    },
  });

  const handleDynamicSubmit = (event: FormEvent) => {
    event.preventDefault();
    submitMutation.mutate();
  };

  if (!resolvedFormKey) {
    return null;
  }

  const loadingLabel = uiLabel(ui, 'contactFormLoading');
  const notFoundLabel = uiLabel(ui, 'contactFormNotFound');
  const submittingLabel = uiLabel(ui, 'contactFormSubmitting');
  const selectPlaceholder = uiLabel(ui, 'formSelectPlaceholder');

  if (formQuery.isLoading) {
    return loadingLabel ? (
      <p className="text-sm text-theme-muted">{loadingLabel}</p>
    ) : null;
  }

  if (formQuery.isError) {
    return notFoundLabel ? (
      <p className="text-sm text-red-600">{notFoundLabel}</p>
    ) : null;
  }

  const fields = formQuery.data?.fields ?? [];
  const displayTitle = title ?? formQuery.data?.name;
  const successMessage = formQuery.data?.successMessage?.trim();
  const submitLabel = formQuery.data?.submitButtonLabel?.trim();

  if (!fields.length || !submitLabel) {
    return null;
  }

  return (
    <div className={className}>
      {displayTitle ? (
        <h2 className="theme-heading mb-2 text-xl">{displayTitle}</h2>
      ) : null}
      {description ? (
        <p className="mb-4 text-sm text-theme-muted">{description}</p>
      ) : null}

      {submitted && successMessage ? (
        <p className="text-sm text-theme-muted">{successMessage}</p>
      ) : (
        <form className="space-y-3" onSubmit={handleDynamicSubmit}>
          {fields.map((field) => (
            <DynamicField
              key={field.name}
              field={field}
              value={dynamicValues[field.name] ?? ''}
              selectPlaceholder={selectPlaceholder}
              onChange={(value) =>
                setDynamicValues((prev) => ({ ...prev, [field.name]: value }))
              }
            />
          ))}
          {errorMessage ? (
            <p className="text-sm text-red-600">{errorMessage}</p>
          ) : null}
          <Button type="submit" disabled={submitMutation.isPending}>
            {submitMutation.isPending && submittingLabel
              ? submittingLabel
              : submitLabel}
          </Button>
        </form>
      )}
    </div>
  );
}

function resolveContactInitialValue(
  field: FormFieldDefinitionDto,
  initialValues: Record<string, string>,
): string {
  if (initialValues[field.name]) return initialValues[field.name];

  const lowerName = field.name.toLowerCase();
  const lowerLabel = field.label.toLowerCase();

  if (
    initialValues.konu &&
    (lowerName.includes('konu') ||
      lowerName.includes('subject') ||
      lowerLabel.includes('konu'))
  ) {
    return initialValues.konu;
  }

  if (
    initialValues.mesaj &&
    (lowerName.includes('mesaj') ||
      lowerName.includes('message') ||
      lowerLabel.includes('mesaj'))
  ) {
    return initialValues.mesaj;
  }

  return '';
}

function DynamicField({
  field,
  value,
  selectPlaceholder,
  onChange,
}: {
  field: FormFieldDefinitionDto;
  value: string;
  selectPlaceholder?: string;
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
          {selectPlaceholder ? (
            <option value="">{selectPlaceholder}</option>
          ) : null}
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
