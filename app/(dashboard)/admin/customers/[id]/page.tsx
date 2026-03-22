import CustomerDetailClient from './customer-detail-client';

// 静态导出需要 generateStaticParams
export function generateStaticParams() {
  return [{ id: '_placeholder_' }];
}

export default function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  return <CustomerDetailClient params={params} />;
}
