import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getOrder } from '@/shared/api/orders.api';
import { OrderDetailPanel } from '@/admin/components/OrderDetailPanel';
import { Card, CardHeader } from '@/shared/ui';

export function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();

  const orderQuery = useQuery({
    queryKey: ['admin', 'orders', id],
    queryFn: () => getOrder(id!),
    enabled: Boolean(id),
  });

  const order = orderQuery.data;

  if (orderQuery.isPending) {
    return <Card padding="sm">Yükleniyor…</Card>;
  }

  if (orderQuery.isError || !order) {
    return (
      <Card padding="sm">
        <p className="text-sm text-slate-600">Sipariş bulunamadı.</p>
        <Link to="/admin/orders" className="mt-2 inline-block text-sm hover:underline">
          ← Sipariş listesi
        </Link>
      </Card>
    );
  }

  return (
    <Card padding="sm">
      <CardHeader
        title={`Sipariş ${order.orderNumber}`}
        description={new Date(order.createdAt).toLocaleString('tr-TR')}
        action={
          <Link to="/admin/orders" className="text-sm text-slate-500 hover:underline">
            ← Listeye dön
          </Link>
        }
      />

      <OrderDetailPanel order={order} />
    </Card>
  );
}
