'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  getPoolInfo,
  buildRemitTransaction,
  submitRemitTransaction,
  getComplianceStatus,
  ApiError,
} from '@/lib/api';
import { signXdr } from '@/lib/wallet';
import { useAuthStore } from '@/store/auth';
import { Button, SendMoneyButton } from '@/components/ui/Button';
import { tokenAContractId, tokenBContractId, tokenACode, tokenBCode } from '@/lib/config';

export default function DashboardPage() {
  const router = useRouter();
  const { user, walletPublicKey, hasHydrated } = useAuthStore();

  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [direction, setDirection] = useState<'a_to_b' | 'b_to_a'>('a_to_b');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!hasHydrated) return; // wait for persisted auth state to load first
    if (!user) router.push('/auth/login');
    else if (!walletPublicKey) router.push('/connect');
  }, [hasHydrated, user, walletPublicKey, router]);

  const poolQuery = useQuery({
    queryKey: ['pool-info'],
    queryFn: getPoolInfo,
    retry: false,
    enabled: !!walletPublicKey,
  });

  const complianceQuery = useQuery({
    queryKey: ['compliance-status'],
    queryFn: getComplianceStatus,
    enabled: !!user,
  });

  const poolError = poolQuery.isError && poolQuery.error instanceof ApiError ? poolQuery.error : null;
  const poolNotConfigured = poolError?.code === 'CONTRACT_NOT_CONFIGURED';

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!walletPublicKey) return;

    setSending(true);
    try {
      const sourceAsset = direction === 'a_to_b' ? tokenACode : tokenBCode;
      const destinationAsset = direction === 'a_to_b' ? tokenBCode : tokenACode;
      const destinationTokenContractId = direction === 'a_to_b' ? tokenBContractId : tokenAContractId;

      // 7-decimal Stellar precision.
      const stroops = String(Math.round(Number(amount) * 10_000_000));

      const { xdr } = await buildRemitTransaction({
        recipientPublicKey: recipient,
        amount: stroops,
        destinationTokenContractId,
        minAmountOut: '1', // demo-only: real UX would compute this from a slippage tolerance
      });

      toast.loading('Confirm the transaction in Freighter…', { id: 'sign' });
      const signedXdr = await signXdr(xdr, walletPublicKey);
      toast.dismiss('sign');

      toast.loading('Submitting to the network…', { id: 'submit' });
      const result = await submitRemitTransaction({
        signedXdr,
        recipientPublicKey: recipient,
        amount: stroops,
        sourceAsset,
        destinationAsset,
      });
      toast.dismiss('submit');

      if (result.status === 'SUCCESS' || result.status === 'success') {
        toast.success(`Sent! Recipient receives ${result.amountOut ?? '…'} (raw units).`);
        setRecipient('');
        setAmount('');
      } else {
        toast.error(`Transaction ${result.status.toLowerCase()}. Check history for details.`);
      }
    } catch (err) {
      toast.dismiss('sign');
      toast.dismiss('submit');
      toast.error(err instanceof Error ? err.message : 'Failed to send remittance');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="text-2xl font-bold text-gray-900">Send a remittance</h1>
      <p className="mt-1 text-sm text-gray-600">
        Signed and settled on Stellar via the deployed remittance-pool contract.
      </p>

      {complianceQuery.data && (
        <div className="mt-6 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700">
          KYC level {complianceQuery.data.kycLevel} ({complianceQuery.data.kycStatus}) — daily
          limit ${complianceQuery.data.limits.dailyUsd.toLocaleString()}
        </div>
      )}

      {poolNotConfigured ? (
        <div className="mt-8 rounded-lg border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-800">
          The remittance pool contract hasn&apos;t been deployed/configured yet. Once deployed
          (see <code>contracts/scripts/deploy-testnet.sh</code>), set{' '}
          <code>REMITTANCE_POOL_CONTRACT_ID</code> in <code>backend/.env</code> and the two token
          IDs in <code>frontend/.env.local</code> to enable sending.
        </div>
      ) : poolQuery.data ? (
        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          <div className="rounded-lg border border-gray-200 p-4">
            <div className="text-xs text-gray-500">Pool reserve A</div>
            <div className="mt-1 font-semibold">{poolQuery.data.reserveA}</div>
          </div>
          <div className="rounded-lg border border-gray-200 p-4">
            <div className="text-xs text-gray-500">Pool reserve B</div>
            <div className="mt-1 font-semibold">{poolQuery.data.reserveB}</div>
          </div>
          <div className="rounded-lg border border-gray-200 p-4">
            <div className="text-xs text-gray-500">Fee</div>
            <div className="mt-1 font-semibold">{poolQuery.data.feeRate / 100}%</div>
          </div>
        </div>
      ) : poolError ? (
        <div className="mt-8 rounded-lg border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-800">
          Couldn&apos;t load pool info: {poolError.message}
        </div>
      ) : null}

      <form onSubmit={handleSend} className="mt-10 space-y-4 rounded-xl border border-gray-200 p-6">
        <div>
          <label className="text-sm font-medium text-gray-700">Direction</label>
          <div className="mt-1 flex gap-2">
            <Button
              type="button"
              variant={direction === 'a_to_b' ? 'default' : 'outline'}
              onClick={() => setDirection('a_to_b')}
            >
              {tokenACode} → {tokenBCode}
            </Button>
            <Button
              type="button"
              variant={direction === 'b_to_a' ? 'default' : 'outline'}
              onClick={() => setDirection('b_to_a')}
            >
              {tokenBCode} → {tokenACode}
            </Button>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">Recipient Stellar address</label>
          <input
            required
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder="G..."
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 font-mono text-sm"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">Amount</label>
          <input
            required
            type="number"
            step="any"
            min="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </div>

        <SendMoneyButton type="submit" loading={sending} disabled={!!poolError} className="w-full">
          Send remittance
        </SendMoneyButton>
      </form>
    </div>
  );
}
