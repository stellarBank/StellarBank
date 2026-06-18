import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRightIcon, BanknotesIcon, GlobeAltIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

export const metadata: Metadata = {
  title: 'StellarBank - Cross-Border Remittance for Emerging Markets',
  description: 'Send money across borders instantly with minimal fees. Powered by Stellar blockchain technology.',
  keywords: 'remittance, cross-border payments, Stellar, blockchain, Nigeria, Africa, emerging markets',
};

const stats = [
  { id: 1, name: 'Countries Supported', value: '50+' },
  { id: 2, name: 'Average Transfer Time', value: '< 30s' },
  { id: 3, name: 'Transaction Fee', value: '0.5%' },
  { id: 4, name: 'Users Served', value: '100K+' },
];

const features = [
  {
    name: 'Instant Transfers',
    description: 'Send money across borders in seconds, not days. Our Stellar-powered infrastructure ensures immediate settlement.',
    icon: BanknotesIcon,
  },
  {
    name: 'Global Reach',
    description: 'Send to 50+ countries with local cash-out options. Extensive agent network across Africa and beyond.',
    icon: GlobeAltIcon,
  },
  {
    name: 'Bank-Grade Security',
    description: 'Multi-signature wallets, end-to-end encryption, and compliance with international standards.',
    icon: ShieldCheckIcon,
  },
];

const testimonials = [
  {
    id: 1,
    quote: "StellarBank transformed how I send money home to Nigeria. What used to take days and cost $50 in fees now takes seconds and costs under $5.",
    author: "Adaora Okafor",
    role: "Software Engineer, London",
    avatar: "/images/testimonials/adaora.jpg"
  },
  {
    id: 2,
    quote: "As a business owner in Lagos, StellarBank helps me pay suppliers in China instantly. No more waiting for wire transfers.",
    author: "Emeka Nwachukwu", 
    role: "Import Business Owner, Lagos",
    avatar: "/images/testimonials/emeka.jpg"
  },
  {
    id: 3,
    quote: "My family in Ghana receives money within minutes. The mobile app is so easy to use, even my grandmother can cash out.",
    author: "Kwame Asante",
    role: "Doctor, Toronto",
    avatar: "/images/testimonials/kwame.jpg"
  }
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
              clipPath: 'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
            }}
          />
        </div>
        
        <div className="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56">
          <div className="hidden sm:mb-8 sm:flex sm:justify-center">
            <div className="relative rounded-full px-3 py-1 text-sm leading-6 text-gray-600 ring-1 ring-gray-900/10 hover:ring-gray-900/20">
              🎉 Now supporting Nigeria ↔ UK corridor.{' '}
              <Link href="/announcements" className="font-semibold text-indigo-600">
                <span className="absolute inset-0" aria-hidden="true" />
                Read more <span aria-hidden="true">&rarr;</span>
              </Link>
            </div>
          </div>
          
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Send Money Across Borders{' '}
              <span className="text-indigo-600">Instantly</span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Join 100,000+ users sending money to Africa and beyond. 
              Powered by Stellar blockchain for instant, affordable, and secure transfers.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link
                href="/auth/register"
                className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Get started
              </Link>
              <Link href="/demo" className="text-sm font-semibold leading-6 text-gray-900">
                Live demo <ArrowRightIcon className="ml-1 h-4 w-4 inline" />
              </Link>
            </div>
          </div>
        </div>
        
        <div className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]">
          <div
            className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]"
            style={{
              clipPath: 'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
            }}
          />
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-white py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <dl className="grid grid-cols-1 gap-x-8 gap-y-16 text-center lg:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.id} className="mx-auto flex max-w-xs flex-col gap-y-4">
                <dt className="text-base leading-7 text-gray-600">{stat.name}</dt>
                <dd className="order-first text-3xl font-semibold tracking-tight text-gray-900 sm:text-5xl">
                  {stat.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-gray-50 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="text-base font-semibold leading-7 text-indigo-600">
              Powered by Stellar Blockchain
            </h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Everything you need to send money globally
            </p>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Built specifically for emerging markets with mobile-first design, 
              offline capabilities, and support for multiple local payment methods.
            </p>
          </div>
          
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
              {features.map((feature) => (
                <div key={feature.name} className="flex flex-col">
                  <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                    <feature.icon className="h-5 w-5 flex-none text-indigo-600" aria-hidden="true" />
                    {feature.name}
                  </dt>
                  <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                    <p className="flex-auto">{feature.description}</p>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="bg-white py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-xl text-center">
            <h2 className="text-lg font-semibold leading-8 tracking-tight text-indigo-600">
              Testimonials
            </h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Trusted by thousands across the globe
            </p>
          </div>
          
          <div className="mx-auto mt-16 flow-root max-w-2xl sm:mt-20 lg:mx-0 lg:max-w-none">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {testimonials.map((testimonial) => (
                <div key={testimonial.id} className="rounded-2xl bg-gray-50 p-8">
                  <figure className="text-sm leading-6">
                    <blockquote className="text-gray-900">
                      <p>"{testimonial.quote}"</p>
                    </blockquote>
                    <figcaption className="mt-6 flex items-center gap-x-4">
                      <Image
                        className="h-10 w-10 rounded-full bg-gray-50"
                        src={testimonial.avatar}
                        alt=""
                        width={40}
                        height={40}
                      />
                      <div>
                        <div className="font-semibold text-gray-900">{testimonial.author}</div>
                        <div className="text-gray-600">{testimonial.role}</div>
                      </div>
                    </figcaption>
                  </figure>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-indigo-600">
        <div className="px-6 py-24 sm:px-6 sm:py-32 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Ready to send money globally?
              <br />
              Join StellarBank today.
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-indigo-200">
              Start with just $10. No monthly fees, no hidden charges. 
              Only pay when you send.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link
                href="/auth/register"
                className="rounded-md bg-white px-3.5 py-2.5 text-sm font-semibold text-indigo-600 shadow-sm hover:bg-indigo-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                Get started for free
              </Link>
              <Link href="/contact" className="text-sm font-semibold leading-6 text-white">
                Contact sales <ArrowRightIcon className="ml-1 h-4 w-4 inline" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}