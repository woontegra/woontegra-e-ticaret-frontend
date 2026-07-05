import { Link } from 'react-router-dom';
import { CheckCircle2, ShoppingBag } from 'lucide-react';
import { getProductPublicPath } from '@/shared/api/products.api';
import { formatMoney } from '@/shared/api/cart.api';
import type { CartItemDto } from '@/shared/types/api';
import { Modal } from '@/shared/ui';

interface CartAddedModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: CartItemDto | null;
  itemCount: number;
}

export function CartAddedModal({
  isOpen,
  onClose,
  item,
  itemCount,
}: CartAddedModalProps) {
  if (!item) return null;

  const productPath = getProductPublicPath({
    slug: item.productSlug,
    productKind: item.productKind,
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Sepete eklendi" size="md">
      <div className="flex gap-4">
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.lineLabel}
            className="h-20 w-20 rounded-md object-cover"
          />
        ) : (
          <div className="flex h-20 w-20 items-center justify-center rounded-md bg-slate-100">
            <ShoppingBag className="h-8 w-8 text-slate-400" />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
            <div>
              <p className="font-medium text-slate-900">{item.lineLabel}</p>
              <p className="text-sm text-slate-500">
                {item.quantity} adet · {formatMoney(item.unitPrice)}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Sepetinizde toplam {itemCount} ürün var.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <Link
          to="/sepet"
          className="theme-btn-primary inline-block rounded-md px-4 py-2 text-sm"
          onClick={onClose}
        >
          Sepete git
        </Link>
        <Link
          to={productPath}
          className="inline-block rounded-md border border-slate-200 px-4 py-2 text-sm"
          onClick={onClose}
        >
          Alışverişe devam
        </Link>
      </div>
    </Modal>
  );
}
