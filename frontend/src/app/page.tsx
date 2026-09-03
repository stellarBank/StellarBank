import { Metadata } from 'next';
import Link from 'next/link';
import { BanknotesIcon, GlobeAltIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

export const metadata: Metadata = {
  title: 'StellarBank - Cross-Border Remittance for Emerging Markets',
  description:
    'A cross-border remittance MVP built on Stellar and Soroban: lock one asset, an on-chain AMM converts it, the recipient gets the other asset instantly.',
  keywords: 'remittance, cross-border payments, Stellar, Soroban, blockchain, hackathon',
};

const steps = [
  {
    name: '1. Connect a Stellar wallet',
    description:
      'No account setup on our end holds your funds. Freighter signs every transaction directly.',
    icon: ShieldCheckIcon,
  },
  {
    name: '2. Pick a recipient and amount',
    description:
      'The recipient only needs a Stellar address — they receive whichever asset the pool is configured for, converted automatically.',
    icon: GlobeAltIcon,
  },
  {
    name: '3. One signed transaction settles it',
    description:
      "transfer_cross_border on the remittance-pool contract swaps and sends in a single atomic call, with slippage protection built in.",
    icon: BanknotesIcon,
  },
];

export default function HomePage() {
  return (
    <>
      {/* Hero Section */}
      <div className="relative isolate px-6 pt-14 lg:px-8">
        <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
          <div
            className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
            style={{
              clipPath:
                'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
            }}
          />
        </div>

        <div className="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56">
          <div className="hidden sm:mb-8 sm:flex sm:justify-center">
            <div className="rounded-full px-3 py-1 text-sm leading-6 text-gray-600 ring-1 ring-gray-900/10">
              Built on Stellar Testnet for a hackathon — see the README for the real setup
            </div>
          </div>

          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Send Money Across Borders{' '}
              <span className="text-indigo-600">Instantly</span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              A cross-border remittance MVP: lock one Stellar asset, an on-chain AMM converts it,
              the recipient receives the other asset in the same signed transaction.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link
                href="/auth/register"
                className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Get started
              </Link>
              <Link href="/dashboard" className="text-sm font-semibold leading-6 text-gray-900">
                Go to dashboard →
              </Link>
            </div>
          </div>
        </div>

        <div className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]">
          <div
            className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]"
            style={{
              clipPath:
                'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
            }}
          />
        </div>
      </div>

      {/* How it works */}
      <div className="bg-gray-50 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="text-base font-semibold leading-7 text-indigo-600">
              Powered by Soroban
            </h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              How a remittance actually moves
            </p>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              No custodial balances, no manual settlement — the constant-product AMM contract
              (<code className="text-indigo-600">remittance-pool</code>) holds both assets and
              handles the conversion atomically.
            </p>
          </div>

          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
              {steps.map((step) => (
                <div key={step.name} className="flex flex-col">
                  <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                    <step.icon className="h-5 w-5 flex-none text-indigo-600" aria-hidden="true" />
                    {step.name}
                  </dt>
                  <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                    <p className="flex-auto">{step.description}</p>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-indigo-600">
        <div className="px-6 py-24 sm:px-6 sm:py-32 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Try it on testnet
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-indigo-200">
              Create an account, connect Freighter, and send a test remittance — no real money
              involved.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link
                href="/auth/register"
                className="rounded-md bg-white px-3.5 py-2.5 text-sm font-semibold text-indigo-600 shadow-sm hover:bg-indigo-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                Get started for free
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
