'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { login } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import { Button } from '@/components/ui/Button';

export default function LoginPage() {
  const router = useRouter();
  const setSession = useAuthStore((s) => s.setSession);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await login({ email, password });
      setSession(result.tokens.accessToken, result.tokens.refreshToken, result.user);
      toast.success('Welcome back!');
      router.push('/dashboard');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md flex-col justify-center px-6 py-12">
      <h1 className="text-2xl font-bold text-gray-900">Log in</h1>
      <p className="mt-2 text-sm text-gray-600">
        New to StellarBank?{' '}
        <Link href="/auth/register" className="font-semibold text-indigo-600">
          Create an account
        </Link>
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <input
          required
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
        <input
          required
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
        <Button type="submit" variant="gradient" size="lg" loading={loading} className="w-full">
          Log in
        </Button>
      </form>
    </div>
  );
}
