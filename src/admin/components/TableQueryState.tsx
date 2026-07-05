import { TableEmpty } from '@/shared/ui';

interface TableQueryStateProps {
  colSpan: number;
  isLoading: boolean;
  isError: boolean;
  isEmpty: boolean;
  loadingMessage?: string;
  emptyMessage?: string;
  errorMessage?: string;
  children: React.ReactNode;
}

export function TableQueryState({
  colSpan,
  isLoading,
  isError,
  isEmpty,
  loadingMessage = 'Yükleniyor…',
  emptyMessage = 'Kayıt bulunamadı.',
  errorMessage = 'Veriler yüklenemedi.',
  children,
}: TableQueryStateProps) {
  if (isLoading) {
    return <TableEmpty colSpan={colSpan} message={loadingMessage} />;
  }

  if (isError) {
    return <TableEmpty colSpan={colSpan} message={errorMessage} />;
  }

  if (isEmpty) {
    return <TableEmpty colSpan={colSpan} message={emptyMessage} />;
  }

  return <>{children}</>;
}
