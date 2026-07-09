'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';

export function Navbar() {
  const router = useRouter();
  const { user, walletPublicKey, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <nav className="border-b border-gray-200 bg-white/80 backdrop-blur sticky top-0 z-20">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-lg font-bold text-indigo-600">
          StellarBank
        </Link>

        <div className="flex items-center gap-6 text-sm font-medium text-gray-700">
          {user ? (
            <>
              <Link href="/dashboard" className="hover:text-indigo-600">
                Dashboard
              </Link>
              <Link href="/dashboard/history" className="hover:text-indigo-600">
                History
              </Link>
              <Link href="/connect" className="hover:text-indigo-600">
                {walletPublicKey ? `${walletPublicKey.slice(0, 4)}…${walletPublicKey.slice(-4)}` : 'Connect Wallet'}
              </Link>
              <button onClick={handleLogout} className="text-gray-500 hover:text-red-600">
                Log out
              </button>
            </>
          ) : (
            <>
              <Link href="/auth/login" className="hover:text-indigo-600">
                Log in
              </Link>
              <Link
                href="/auth/register"
                className="rounded-md bg-indigo-600 px-4 py-2 text-white shadow-sm hover:bg-indigo-500"
              >
                Get started
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
