import TicketDetailClient from './ticket-detail-client';

// 静态导出需要 generateStaticParams
export function generateStaticParams() {
  return [{ id: '_placeholder_' }];
}

export default function TicketDetailPage({ params }: { params: Promise<{ id: string }> }) {
  return <TicketDetailClient params={params} />;
}
