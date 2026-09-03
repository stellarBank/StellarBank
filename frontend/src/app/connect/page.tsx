'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { connectFreighter, isFreighterInstalled } from '@/lib/wallet';
import { linkWallet } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import { ConnectWalletButton } from '@/components/ui/Button';

export default function ConnectPage() {
  const router = useRouter();
  const { user, walletPublicKey, setWallet, hasHydrated } = useAuthStore();
  const [installed, setInstalled] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!hasHydrated) return; // wait for persisted auth state to load first
    if (!user) {
      router.push('/auth/login');
      return;
    }
    isFreighterInstalled().then(setInstalled);
  }, [hasHydrated, user, router]);

  const handleConnect = async () => {
    setLoading(true);
    try {
      const publicKey = await connectFreighter();
      const result = await linkWallet(publicKey);
      setWallet(publicKey);
      toast.success(
        result.alreadyLinked ? 'Wallet already linked — you\'re set' : 'Wallet linked successfully'
      );
      router.push('/dashboard');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not connect Freighter');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md flex-col items-center justify-center px-6 py-12 text-center">
      <h1 className="text-2xl font-bold text-gray-900">Connect your Stellar wallet</h1>
      <p className="mt-2 text-sm text-gray-600">
        StellarBank never holds your keys. Sending money means signing a transaction directly in
        your own wallet.
      </p>

      <div className="mt-8">
        {walletPublicKey ? (
          <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
            Connected: {walletPublicKey.slice(0, 6)}…{walletPublicKey.slice(-6)}
          </div>
        ) : installed === false ? (
          <p className="text-sm text-red-600">
            Freighter isn&apos;t installed.{' '}
            <a
              href="https://www.freighter.app/"
              target="_blank"
              rel="noreferrer"
              className="underline"
            >
              Install it
            </a>{' '}
            and refresh this page.
          </p>
        ) : (
          <ConnectWalletButton onClick={handleConnect} loading={loading} />
        )}
      </div>
    </div>
  );
}
