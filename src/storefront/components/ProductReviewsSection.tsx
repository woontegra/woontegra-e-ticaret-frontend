import { useState, type FormEvent } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { ApiError } from '@/shared/api/client';
import {
  listPublicProductReviews,
  submitProductReview,
} from '@/shared/api/reviews.api';
import { uiLabel, uiLabelFormat } from '@/shared/lib/storefront-ui';
import { Button, Input, Label, Textarea } from '@/shared/ui';
import { StarRatingDisplay, StarRatingInput } from '@/storefront/components/StarRating';
import { useStorefrontUi } from '@/storefront/hooks/useStorefrontUi';

interface ProductReviewsSectionProps {
  productSlug: string;
}

export function ProductReviewsSection({ productSlug }: ProductReviewsSectionProps) {
  const ui = useStorefrontUi();
  const reviewsTitle = uiLabel(ui, 'reviewsTitle');
  const reviewsEmpty = uiLabel(ui, 'reviewsEmpty');
  const reviewsLoading = uiLabel(ui, 'reviewsLoading');
  const reviewsStoreReply = uiLabel(ui, 'reviewsStoreReply');
  const reviewsPrev = uiLabel(ui, 'reviewsPrev');
  const reviewsNext = uiLabel(ui, 'reviewsNext');
  const reviewsWriteTitle = uiLabel(ui, 'reviewsWriteTitle');
  const reviewsModerationNote = uiLabel(ui, 'reviewsModerationNote');
  const reviewsThankYou = uiLabel(ui, 'reviewsThankYou');
  const reviewsRatingLabel = uiLabel(ui, 'reviewsRatingLabel');
  const reviewsNameLabel = uiLabel(ui, 'reviewsNameLabel');
  const reviewsEmailLabel = uiLabel(ui, 'reviewsEmailLabel');
  const reviewsTitleLabel = uiLabel(ui, 'reviewsTitleLabel');
  const reviewsCommentLabel = uiLabel(ui, 'reviewsCommentLabel');
  const reviewsSubmitPending = uiLabel(ui, 'reviewsSubmitPending');
  const reviewsSubmit = uiLabel(ui, 'reviewsSubmit');
  const reviewsSubmitError = uiLabel(ui, 'reviewsSubmitError');

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
        error instanceof ApiError
          ? error.message
          : reviewsSubmitError ?? null,
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
  const reviewsCountText = uiLabelFormat(ui, 'reviewsCount', { count: total });

  if (
    !reviewsTitle &&
    !reviewsEmpty &&
    !reviewsLoading &&
    !reviewsWriteTitle
  ) {
    return null;
  }

  return (
    <section className="mt-10 border-t border-slate-200 pt-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          {reviewsTitle ? (
            <h2 className="text-lg font-semibold text-slate-900">{reviewsTitle}</h2>
          ) : null}
          {averageRating !== null && averageRating !== undefined ? (
            reviewsCountText ? (
              <div className="mt-2 flex items-center gap-2 text-sm text-slate-600">
                <StarRatingDisplay rating={Math.round(averageRating)} />
                <span>
                  {averageRating.toFixed(1)} · {reviewsCountText}
                </span>
              </div>
            ) : null
          ) : reviewsEmpty ? (
            <p className="mt-1 text-sm text-slate-500">{reviewsEmpty}</p>
          ) : null}
        </div>
      </div>

      {reviewsQuery.isLoading ? (
        reviewsLoading ? (
          <p className="mt-6 text-sm text-slate-500">{reviewsLoading}</p>
        ) : null
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
              {review.adminReply && reviewsStoreReply ? (
                <div className="mt-3 rounded-md bg-slate-50 p-3 text-sm">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {reviewsStoreReply}
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

      {totalPages > 1 && (reviewsPrev || reviewsNext) ? (
        <div className="mt-4 flex gap-2">
          {reviewsPrev ? (
            <Button
              size="sm"
              variant="secondary"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              {reviewsPrev}
            </Button>
          ) : null}
          {reviewsNext ? (
            <Button
              size="sm"
              variant="secondary"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              {reviewsNext}
            </Button>
          ) : null}
        </div>
      ) : null}

      {reviewsWriteTitle ||
      reviewsModerationNote ||
      reviewsThankYou ||
      reviewsRatingLabel ||
      reviewsSubmit ? (
        <div className="mt-8 rounded-lg border border-slate-200 bg-white p-4">
          {reviewsWriteTitle ? (
            <h3 className="text-base font-semibold text-slate-900">
              {reviewsWriteTitle}
            </h3>
          ) : null}
          {reviewsModerationNote ? (
            <p className="mt-1 text-sm text-slate-500">{reviewsModerationNote}</p>
          ) : null}

          {submitted && reviewsThankYou ? (
            <div className="mt-4 rounded-md bg-emerald-50 p-4 text-sm text-emerald-800">
              {reviewsThankYou}
            </div>
          ) : reviewsSubmit ? (
            <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
              {reviewsRatingLabel ? (
                <div>
                  <Label>{reviewsRatingLabel}</Label>
                  <StarRatingInput
                    value={form.rating}
                    onChange={(rating) => setForm((prev) => ({ ...prev, rating }))}
                  />
                </div>
              ) : null}

              {(reviewsNameLabel || reviewsEmailLabel) && (
                <div className="grid gap-4 sm:grid-cols-2">
                  {reviewsNameLabel ? (
                    <div>
                      <Label htmlFor="review-name">{reviewsNameLabel}</Label>
                      <Input
                        id="review-name"
                        required
                        value={form.name}
                        onChange={(e) =>
                          setForm((prev) => ({ ...prev, name: e.target.value }))
                        }
                      />
                    </div>
                  ) : null}
                  {reviewsEmailLabel ? (
                    <div>
                      <Label htmlFor="review-email">{reviewsEmailLabel}</Label>
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
                  ) : null}
                </div>
              )}

              {reviewsTitleLabel ? (
                <div>
                  <Label htmlFor="review-title">{reviewsTitleLabel}</Label>
                  <Input
                    id="review-title"
                    value={form.title}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, title: e.target.value }))
                    }
                  />
                </div>
              ) : null}

              {reviewsCommentLabel ? (
                <div>
                  <Label htmlFor="review-comment">{reviewsCommentLabel}</Label>
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
              ) : null}

              {errorMessage ? (
                <p className="text-sm text-red-600">{errorMessage}</p>
              ) : null}

              <Button type="submit" disabled={submitMutation.isPending}>
                {submitMutation.isPending ? reviewsSubmitPending : reviewsSubmit}
              </Button>
            </form>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
