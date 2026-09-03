'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { register as registerRequest, login } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import { Button } from '@/components/ui/Button';

export default function RegisterPage() {
  const router = useRouter();
  const setSession = useAuthStore((s) => s.setSession);
  const [form, setForm] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    countryCode: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await registerRequest({ ...form, countryCode: form.countryCode.toUpperCase() });
      const result = await login({ email: form.email, password: form.password });
      setSession(result.tokens.accessToken, result.tokens.refreshToken, result.user);
      toast.success('Welcome to StellarBank!');
      router.push('/connect');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md flex-col justify-center px-6 py-12">
      <h1 className="text-2xl font-bold text-gray-900">Create your account</h1>
      <p className="mt-2 text-sm text-gray-600">
        Already have one?{' '}
        <Link href="/auth/login" className="font-semibold text-indigo-600">
          Log in
        </Link>
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <input
            required
            placeholder="First name"
            value={form.firstName}
            onChange={handleChange('firstName')}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
          <input
            required
            placeholder="Last name"
            value={form.lastName}
            onChange={handleChange('lastName')}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
        <input
          required
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange('email')}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
        <input
          required
          type="password"
          placeholder="Password (8+ characters)"
          minLength={8}
          value={form.password}
          onChange={handleChange('password')}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
        <input
          required
          placeholder="Country code (e.g. NG, US, GB)"
          maxLength={2}
          value={form.countryCode}
          onChange={handleChange('countryCode')}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm uppercase"
        />
        <Button type="submit" variant="gradient" size="lg" loading={loading} className="w-full">
          Create account
        </Button>
      </form>
    </div>
  );
}
