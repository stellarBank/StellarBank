'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { listTransactions } from '@/lib/api';
import { useAuthStore } from '@/store/auth';

function statusColor(status: string) {
  switch (status) {
    case 'success':
      return 'bg-green-100 text-green-800';
    case 'failed':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-yellow-100 text-yellow-800';
  }
}

export default function HistoryPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const hasHydrated = useAuthStore((s) => s.hasHydrated);

  useEffect(() => {
    if (!hasHydrated) return; // wait for persisted auth state to load first
    if (!user) router.push('/auth/login');
  }, [hasHydrated, user, router]);

  const { data, isLoading } = useQuery({
    queryKey: ['transactions'],
    queryFn: listTransactions,
    enabled: !!user,
  });

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="text-2xl font-bold text-gray-900">History</h1>
      <p className="mt-1 text-sm text-gray-600">Your past remittances.</p>

      <div className="mt-8 overflow-x-auto rounded-xl border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Date</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Recipient</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Amount</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Status</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Tx hash</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-gray-500">
                  Loading…
                </td>
              </tr>
            ) : !data || data.transactions.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-gray-500">
                  No transactions yet — send your first remittance from the dashboard.
                </td>
              </tr>
            ) : (
              data.transactions.map((tx) => (
                <tr key={tx.id}>
                  <td className="px-4 py-3 whitespace-nowrap text-gray-700">
                    {format(new Date(tx.created_at), 'MMM d, HH:mm')}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-700">
                    {tx.recipient_address.slice(0, 6)}…{tx.recipient_address.slice(-6)}
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {tx.amount} {tx.source_asset} → {tx.amount_out ?? '…'} {tx.destination_asset}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-1 text-xs font-medium ${statusColor(tx.status)}`}>
                      {tx.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">
                    {tx.stellar_tx_hash ? `${tx.stellar_tx_hash.slice(0, 8)}…` : '—'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
