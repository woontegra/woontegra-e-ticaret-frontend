import { useState, type FormEvent } from 'react';
import { useMutation } from '@tanstack/react-query';
import { subscribeNewsletter } from '@/shared/api/newsletter.api';

interface NewsletterFormProps {
  title?: string | null;
  description?: string | null;
  placeholder?: string | null;
  buttonLabel?: string | null;
  successMessage?: string | null;
  source?: string;
  className?: string;
}

export function NewsletterForm({
  title,
  description,
  placeholder,
  buttonLabel,
  successMessage,
  source = 'newsletter',
  className,
}: NewsletterFormProps) {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const mutation = useMutation({
    mutationFn: () => subscribeNewsletter({ email: email.trim(), source }),
    onSuccess: () => setSubmitted(true),
  });

  if (!placeholder?.trim() || !buttonLabel?.trim()) {
    return null;
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!email.trim()) return;
    mutation.mutate();
  };

  return (
    <div className={className}>
      {title?.trim() ? (
        <h2 className="theme-heading text-xl">{title}</h2>
      ) : null}
      {description?.trim() ? (
        <p className="mt-2 text-sm text-theme-muted">{description}</p>
      ) : null}

      {submitted && successMessage?.trim() ? (
        <p className="mt-4 text-sm text-theme-muted">{successMessage}</p>
      ) : (
        <form
          className="mt-4 flex flex-col gap-2 sm:flex-row"
          onSubmit={handleSubmit}
        >
          <input
            type="email"
            name="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder={placeholder}
            aria-label={placeholder}
            className="flex-1 rounded-md border border-slate-200 px-3 py-2 text-sm"
          />
          <button
            type="submit"
            disabled={mutation.isPending}
            className="theme-btn-primary px-4 py-2 text-sm disabled:opacity-60"
          >
            {buttonLabel}
          </button>
        </form>
      )}
    </div>
  );
}
