import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { ProductReviewDto } from '@/shared/types/api';
import { ApiError } from '@/shared/api/client';
import {
  approveProductReview,
  deleteProductReview,
  PRODUCT_REVIEW_STATUS_LABELS,
  rejectProductReview,
  replyProductReview,
} from '@/shared/api/reviews.api';
import { getProductPublicPath } from '@/shared/api/products.api';
import { useAdminMutationFeedback } from '@/admin/hooks/useAdminMutationFeedback';
import { useDisclosure } from '@/shared/hooks/useDisclosure';
import { Badge, Button, ConfirmDialog, Label, Textarea } from '@/shared/ui';
import { StarRatingDisplay } from '@/storefront/components/StarRating';

interface ProductReviewDetailPanelProps {
  review: ProductReviewDto;
  onDeleted?: () => void;
}

export function ProductReviewDetailPanel({
  review,
  onDeleted,
}: ProductReviewDetailPanelProps) {
  const queryClient = useQueryClient();
  const deleteModal = useDisclosure();
  const { onSuccess, onError } = useAdminMutationFeedback();
  const [adminReply, setAdminReply] = useState(review.adminReply ?? '');
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    setAdminReply(review.adminReply ?? '');
  }, [review.id, review.adminReply]);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['admin', 'product-reviews'] });
    queryClient.invalidateQueries({
      queryKey: ['admin', 'product-reviews', review.id],
    });
    if (review.productSlug) {
      queryClient.invalidateQueries({
        queryKey: ['public', 'products', review.productSlug, 'reviews'],
      });
    }
  };

  const approveMutation = useMutation({
    mutationFn: () => approveProductReview(review.id),
    onSuccess: () => {
      invalidate();
      setFeedback('Yorum onaylandı ve yayına alındı.');
    },
  });

  const rejectMutation = useMutation({
    mutationFn: () => rejectProductReview(review.id),
    onSuccess: () => {
      invalidate();
      setFeedback('Yorum reddedildi.');
    },
  });

  const replyMutation = useMutation({
    mutationFn: () => replyProductReview(review.id, adminReply.trim()),
    onSuccess: () => {
      invalidate();
      setFeedback('Mağaza cevabı kaydedildi.');
    },
    onError: (error) => {
      setFeedback(
        error instanceof ApiError ? error.message : 'Cevap kaydedilemedi',
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteProductReview(review.id),
    onSuccess: () => {
      invalidate();
      deleteModal.close();
      onSuccess('Yorum silindi.');
      onDeleted?.();
    },
    onError: (error) => onError(error, 'Yorum silinemedi.'),
  });

  const productPath =
    review.productSlug && review.productKind
      ? getProductPublicPath({
          slug: review.productSlug,
          productKind: review.productKind,
        })
      : null;

  return (
    <div className="space-y-6 text-sm">
      <div className="flex flex-wrap items-center gap-2">
        <Badge
          variant={
            review.status === 'PENDING'
              ? 'warning'
              : review.status === 'REJECTED'
                ? 'danger'
                : 'success'
          }
        >
          {PRODUCT_REVIEW_STATUS_LABELS[review.status]}
        </Badge>
        <StarRatingDisplay rating={review.rating} />
      </div>

      <section>
        <h3 className="font-semibold text-slate-800">Ürün</h3>
        {review.productName ? (
          productPath ? (
            <Link
              to={productPath}
              target="_blank"
              className="mt-1 inline-block text-slate-800 hover:underline"
            >
              {review.productName}
            </Link>
          ) : (
            <p className="mt-1">{review.productName}</p>
          )
        ) : (
          <p className="mt-1 text-slate-500">—</p>
        )}
      </section>

      <section>
        <h3 className="font-semibold text-slate-800">Yorumcu</h3>
        <dl className="mt-2 space-y-1">
          <div>
            <dt className="text-slate-500">Ad</dt>
            <dd>{review.name}</dd>
          </div>
          <div>
            <dt className="text-slate-500">E-posta</dt>
            <dd>
              <a href={`mailto:${review.email}`} className="hover:underline">
                {review.email}
              </a>
            </dd>
          </div>
        </dl>
      </section>

      <section>
        <h3 className="font-semibold text-slate-800">Yorum</h3>
        {review.title ? (
          <p className="mt-2 font-medium text-slate-800">{review.title}</p>
        ) : null}
        <p className="mt-2 whitespace-pre-wrap text-slate-700">{review.comment}</p>
      </section>

      {review.status === 'PENDING' ? (
        <section className="flex flex-wrap gap-2">
          <Button
            size="sm"
            disabled={approveMutation.isPending}
            onClick={() => approveMutation.mutate()}
          >
            Onayla
          </Button>
          <Button
            size="sm"
            variant="secondary"
            disabled={rejectMutation.isPending}
            onClick={() => rejectMutation.mutate()}
          >
            Reddet
          </Button>
        </section>
      ) : null}

      <section>
        <Label>Mağaza cevabı</Label>
        <Textarea
          className="mt-1"
          rows={4}
          value={adminReply}
          placeholder="Yorumda görünecek mağaza cevabı…"
          onChange={(e) => setAdminReply(e.target.value)}
        />
        <Button
          size="sm"
          className="mt-2"
          disabled={replyMutation.isPending || !adminReply.trim()}
          onClick={() => replyMutation.mutate()}
        >
          Cevabı kaydet
        </Button>
        {review.adminReply ? (
          <p className="mt-2 text-xs text-slate-500">
            Mevcut cevap yayında görünür (onaylı yorumlarda).
          </p>
        ) : null}
      </section>

      <section className="border-t border-slate-100 pt-4">
        <Button
          size="sm"
          variant="danger"
          disabled={deleteMutation.isPending}
          onClick={deleteModal.open}
        >
          Yorumu sil
        </Button>
      </section>

      <ConfirmDialog
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.close}
        title="Yorumu sil"
        description="Bu yorum kalıcı olarak silinecek. Devam edilsin mi?"
        confirmLabel="Sil"
        isLoading={deleteMutation.isPending}
        onConfirm={() => deleteMutation.mutate()}
      />

      {feedback ? <p className="text-slate-600">{feedback}</p> : null}

      <p className="text-xs text-slate-400">
        {new Date(review.createdAt).toLocaleString('tr-TR')}
        {review.approvedAt
          ? ` · Onay: ${new Date(review.approvedAt).toLocaleString('tr-TR')}`
          : null}
      </p>
    </div>
  );
}
