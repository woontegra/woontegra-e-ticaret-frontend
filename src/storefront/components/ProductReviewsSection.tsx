import { useState, type FormEvent } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { ApiError } from '@/shared/api/client';
import {
  listPublicProductReviews,
  submitProductReview,
} from '@/shared/api/reviews.api';
import { Button, Input, Label, Textarea } from '@/shared/ui';
import { StarRatingDisplay, StarRatingInput } from '@/storefront/components/StarRating';

interface ProductReviewsSectionProps {
  productSlug: string;
}

export function ProductReviewsSection({ productSlug }: ProductReviewsSectionProps) {
  const [page, setPage] = useState(1);
  const [form, setForm] = useState({
    name: '',
    email: '',
    rating: 5,
    title: '',
    comment: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const reviewsQuery = useQuery({
    queryKey: ['public', 'products', productSlug, 'reviews', page],
    queryFn: () => listPublicProductReviews(productSlug, { page, limit: 10 }),
  });

  const submitMutation = useMutation({
    mutationFn: () =>
      submitProductReview(productSlug, {
        name: form.name.trim(),
        email: form.email.trim(),
        rating: form.rating,
        title: form.title.trim() || null,
        comment: form.comment.trim(),
      }),
    onSuccess: () => {
      setSubmitted(true);
      setErrorMessage(null);
      setForm({ name: '', email: '', rating: 5, title: '', comment: '' });
    },
    onError: (error) => {
      setErrorMessage(
        error instanceof ApiError ? error.message : 'Yorum gönderilemedi',
      );
    },
  });

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    submitMutation.mutate();
  };

  const total = reviewsQuery.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / 10));
  const averageRating = reviewsQuery.data?.averageRating;

  return (
    <section className="mt-10 border-t border-slate-200 pt-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Müşteri yorumları</h2>
          {averageRating !== null && averageRating !== undefined ? (
            <div className="mt-2 flex items-center gap-2 text-sm text-slate-600">
              <StarRatingDisplay rating={Math.round(averageRating)} />
              <span>
                {averageRating.toFixed(1)} · {total} yorum
              </span>
            </div>
          ) : (
            <p className="mt-1 text-sm text-slate-500">Henüz onaylı yorum yok.</p>
          )}
        </div>
      </div>

      {reviewsQuery.isLoading ? (
        <p className="mt-6 text-sm text-slate-500">Yorumlar yükleniyor…</p>
      ) : (reviewsQuery.data?.items.length ?? 0) > 0 ? (
        <ul className="mt-6 space-y-4">
          {reviewsQuery.data!.items.map((review) => (
            <li
              key={review.id}
              className="rounded-lg border border-slate-200 bg-white p-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-medium text-slate-900">{review.name}</p>
                  <p className="text-xs text-slate-500">
                    {new Date(review.createdAt).toLocaleDateString('tr-TR')}
                  </p>
                </div>
                <StarRatingDisplay rating={review.rating} />
              </div>
              {review.title ? (
                <p className="mt-2 font-medium text-slate-800">{review.title}</p>
              ) : null}
              <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">
                {review.comment}
              </p>
              {review.adminReply ? (
                <div className="mt-3 rounded-md bg-slate-50 p-3 text-sm">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Mağaza cevabı
                  </p>
                  <p className="mt-1 whitespace-pre-wrap text-slate-700">
                    {review.adminReply}
                  </p>
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}

      {totalPages > 1 ? (
        <div className="mt-4 flex gap-2">
          <Button
            size="sm"
            variant="secondary"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Önceki
          </Button>
          <Button
            size="sm"
            variant="secondary"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Sonraki
          </Button>
        </div>
      ) : null}

      <div className="mt-8 rounded-lg border border-slate-200 bg-white p-4">
        <h3 className="text-base font-semibold text-slate-900">Yorum yaz</h3>
        <p className="mt-1 text-sm text-slate-500">
          Yorumunuz onaylandıktan sonra bu sayfada görünür.
        </p>

        {submitted ? (
          <div className="mt-4 rounded-md bg-emerald-50 p-4 text-sm text-emerald-800">
            Teşekkürler! Yorumunuz incelenmek üzere alındı.
          </div>
        ) : (
          <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
            <div>
              <Label>Puanınız</Label>
              <StarRatingInput
                value={form.rating}
                onChange={(rating) => setForm((prev) => ({ ...prev, rating }))}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="review-name">Adınız</Label>
                <Input
                  id="review-name"
                  required
                  value={form.name}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, name: e.target.value }))
                  }
                />
              </div>
              <div>
                <Label htmlFor="review-email">E-posta</Label>
                <Input
                  id="review-email"
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, email: e.target.value }))
                  }
                />
              </div>
            </div>

            <div>
              <Label htmlFor="review-title">Başlık (isteğe bağlı)</Label>
              <Input
                id="review-title"
                value={form.title}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, title: e.target.value }))
                }
              />
            </div>

            <div>
              <Label htmlFor="review-comment">Yorumunuz</Label>
              <Textarea
                id="review-comment"
                required
                rows={4}
                value={form.comment}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, comment: e.target.value }))
                }
              />
            </div>

            {errorMessage ? (
              <p className="text-sm text-red-600">{errorMessage}</p>
            ) : null}

            <Button type="submit" disabled={submitMutation.isPending}>
              {submitMutation.isPending ? 'Gönderiliyor…' : 'Yorumu gönder'}
            </Button>
          </form>
        )}
      </div>
    </section>
  );
}
