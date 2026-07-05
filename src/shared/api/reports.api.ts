import type {
  DashboardSummaryDto,
  ReportLowStockProductsResult,
  ReportNewCustomersResult,
  ReportOrdersByStatusResult,
  ReportPaymentMethodSummaryResult,
  ReportSalesByDayResult,
  ReportTopProductsResult,
} from '@/shared/types/api';
import { apiClient } from './client';

export type ReportDateParams = {
  dateFrom?: string;
  dateTo?: string;
};

function buildDateQuery(params: ReportDateParams = {}) {
  const query = new URLSearchParams();
  if (params.dateFrom) query.set('dateFrom', params.dateFrom);
  if (params.dateTo) query.set('dateTo', params.dateTo);
  const suffix = query.toString();
  return suffix ? `?${suffix}` : '';
}

export function getDashboardSummary(params: ReportDateParams = {}) {
  return apiClient<DashboardSummaryDto>(
    `/api/admin/dashboard/summary${buildDateQuery(params)}`,
  );
}

export function getSalesByDay(params: ReportDateParams = {}) {
  return apiClient<ReportSalesByDayResult>(
    `/api/admin/reports/sales-by-day${buildDateQuery(params)}`,
  );
}

export function getOrdersByStatus(params: ReportDateParams = {}) {
  return apiClient<ReportOrdersByStatusResult>(
    `/api/admin/reports/orders-by-status${buildDateQuery(params)}`,
  );
}

export function getTopProducts(params: ReportDateParams & { limit?: number } = {}) {
  const query = new URLSearchParams();
  if (params.dateFrom) query.set('dateFrom', params.dateFrom);
  if (params.dateTo) query.set('dateTo', params.dateTo);
  if (params.limit) query.set('limit', String(params.limit));
  const suffix = query.toString();
  return apiClient<ReportTopProductsResult>(
    `/api/admin/reports/top-products${suffix ? `?${suffix}` : ''}`,
  );
}

export function getLowStockProducts() {
  return apiClient<ReportLowStockProductsResult>(
    '/api/admin/reports/low-stock-products',
  );
}

export function getNewCustomers(params: ReportDateParams = {}) {
  return apiClient<ReportNewCustomersResult>(
    `/api/admin/reports/new-customers${buildDateQuery(params)}`,
  );
}

export function getPaymentMethodSummary(params: ReportDateParams = {}) {
  return apiClient<ReportPaymentMethodSummaryResult>(
    `/api/admin/reports/payment-method-summary${buildDateQuery(params)}`,
  );
}

export function formatReportMoney(value: number) {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    maximumFractionDigits: 0,
  }).format(value);
}

export function defaultReportDateRange() {
  const dateTo = new Date();
  const dateFrom = new Date(dateTo.getTime() - 29 * 24 * 60 * 60 * 1000);
  return {
    dateFrom: dateFrom.toISOString().slice(0, 10),
    dateTo: dateTo.toISOString().slice(0, 10),
  };
}
