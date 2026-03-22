import UserDetailClient from './user-detail-client';

// 静态导出需要 generateStaticParams
export function generateStaticParams() {
  return [{ id: '_placeholder_' }];
}

export default function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  return <UserDetailClient params={params} />;
}
