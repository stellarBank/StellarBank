# 📱 StellarBank Frontend

> Modern, responsive web application for cross-border remittance powered by Next.js and Stellar blockchain

[![Next.js](https://img.shields.io/badge/Next.js-14.0%2B-black)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-18%2B-blue)](https://reactjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3%2B-blue)](https://typescriptlang.org)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.3%2B-38bdf8)](https://tailwindcss.com)
[![Stellar](https://img.shields.io/badge/Stellar-SDK-brightgreen)](https://stellar.org)

## 🌟 Features

### 💸 **Send Money Globally**
- Instant cross-border transfers via Stellar network
- Real-time exchange rate calculator
- Multi-currency support (USD, NGN, GBP, EUR)
- Transaction fee transparency

### 🔐 **Secure Authentication**
- Multi-factor authentication (2FA)
- Biometric login support
- Hardware wallet integration
- Social login options

### 📊 **Comprehensive Dashboard**
- Transaction history and analytics
- Real-time balance tracking
- Exchange rate monitoring
- Beneficiary management

### 🎨 **Modern UI/UX**
- Responsive design for all devices
- Dark/light theme support
- Multi-language support (EN, FR, HA, YO, IG)
- Accessibility compliance (WCAG 2.1)

### 💱 **Advanced Trading**
- Stellar DEX integration
- Limit orders and market orders
- Portfolio management
- Price alerts and notifications

---

## 🚀 Quick Start

### Prerequisites
```bash
# Required
Node.js 16+ 
npm 8+ or yarn 1.22+

# Optional
Git 2.20+
VS Code with recommended extensions
```

### Installation
```bash
# Clone the repository
git clone https://github.com/presidojay1/StellarBank.git
cd StellarBank/frontend

# Install dependencies
npm install
# or
yarn install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your configuration

# Start development server
npm run dev
# or
yarn dev
```

### 🌐 Access the Application
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🏗️ Project Structure

```
frontend/
├── 📁 public/                 # Static assets
│   ├── icons/                 # App icons and favicons  
│   ├── images/                # Images and graphics
│   └── locales/               # Translation files
├── 📁 src/
│   ├── 📁 app/                # Next.js 14 App Router
│   │   ├── (auth)/           # Authentication routes
│   │   ├── (dashboard)/      # Protected dashboard routes
│   │   ├── api/              # API routes
│   │   ├── globals.css       # Global styles
│   │   ├── layout.tsx        # Root layout
│   │   └── page.tsx          # Home page
│   ├── 📁 components/        # Reusable UI components
│   │   ├── ui/               # Base UI components
│   │   ├── forms/            # Form components
│   │   ├── charts/           # Chart components
│   │   └── layout/           # Layout components
│   ├── 📁 hooks/             # Custom React hooks
│   ├── 📁 lib/               # Utility functions
│   │   ├── stellar.ts        # Stellar SDK integration
│   │   ├── utils.ts          # General utilities
│   │   └── validations.ts    # Zod schemas
│   ├── 📁 store/             # State management
│   ├── 📁 types/             # TypeScript type definitions
│   └── 📁 constants/         # App constants
├── 📁 tests/                 # Test files
│   ├── __mocks__/            # Test mocks
│   ├── e2e/                  # End-to-end tests
│   └── unit/                 # Unit tests
├── 📄 next.config.js         # Next.js configuration
├── 📄 tailwind.config.js     # TailwindCSS configuration
├── 📄 tsconfig.json          # TypeScript configuration
└── 📄 package.json           # Dependencies and scripts
```

---

## 🛠️ Technology Stack

### **Core Framework**
- **Next.js 14** - React framework with App Router
- **React 18** - UI library with concurrent features
- **TypeScript 5.3** - Type-safe JavaScript

### **Styling & UI**
- **TailwindCSS 3.3** - Utility-first CSS framework
- **Radix UI** - Unstyled, accessible UI primitives
- **Framer Motion** - Animation library
- **Lucide React** - Beautiful icon library

### **State Management**
- **Zustand** - Lightweight state management
- **TanStack Query** - Server state management
- **React Hook Form** - Form state management

### **Blockchain Integration**
- **Stellar SDK** - Stellar blockchain interaction
- **WalletConnect** - Multi-wallet support
- **Freighter Wallet** - Native Stellar wallet

### **Development Tools**
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Husky** - Git hooks
- **Jest** - Unit testing
- **Playwright** - E2E testing

---

## 🎨 Design System

### **Color Palette**
```css
/* Primary Colors */
--stellar-blue: #1e40af;
--stellar-light: #3b82f6;
--success-green: #10b981;
--warning-amber: #f59e0b;
--error-red: #ef4444;

/* Neutral Colors */  
--gray-50: #f9fafb;
--gray-900: #111827;
```

### **Typography**
- **Primary:** Inter (headings, UI)
- **Secondary:** JetBrains Mono (code, numbers)
- **Sizes:** 12px - 48px scale

### **Components**
All components follow the StellarBank Design System with:
- Consistent spacing (4px grid)
- Standardized border radius (4px, 8px, 12px)
- Accessible color contrast ratios
- Mobile-first responsive breakpoints

---

## 🔧 Configuration

### **Environment Variables**
```bash
# .env.local
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_STELLAR_NETWORK=testnet
NEXT_PUBLIC_STELLAR_HORIZON_URL=https://horizon-testnet.stellar.org
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=your_ga_id
```

### **Next.js Configuration**
```javascript
// next.config.js
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: ['stellarbank.io', 'api.stellarbank.io'],
  },
  i18n: {
    locales: ['en', 'fr', 'ha', 'yo', 'ig'],
    defaultLocale: 'en',
  },
};
```

---

## 🧪 Testing

### **Unit Tests**
```bash
# Run unit tests
npm run test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

### **E2E Tests**
```bash
# Run E2E tests
npm run e2e

# Run with UI
npm run e2e:ui

# Run specific test
npm run e2e -- tests/login.spec.ts
```

### **Test Coverage Goals**
- **Unit Tests:** >90%
- **Integration Tests:** >80%
- **E2E Tests:** Critical user journeys

---

## 📦 Build & Deployment

### **Local Build**
```bash
# Create production build
npm run build

# Start production server
npm run start

# Analyze bundle size
npm run analyze
```

### **Docker Deployment**
```bash
# Build Docker image
docker build -t stellarbank-frontend .

# Run container
docker run -p 3000:3000 stellarbank-frontend
```

### **Vercel Deployment**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to Vercel
vercel --prod
```

---

## 🌍 Internationalization

### **Supported Languages**
- 🇺🇸 English (en) - Default
- 🇫🇷 French (fr) - West Africa
- 🇳🇬 Hausa (ha) - Northern Nigeria  
- 🇳🇬 Yoruba (yo) - Southwest Nigeria
- 🇳🇬 Igbo (ig) - Southeast Nigeria

### **Adding New Language**
```bash
# 1. Add locale to next.config.js
# 2. Create translation file
mkdir -p public/locales/[locale]
touch public/locales/[locale]/common.json

# 3. Add translations
{
  "welcome": "Welcome to StellarBank",
  "send_money": "Send Money",
  "receive_money": "Receive Money"
}
```

---

## 🔐 Security

### **Authentication Flow**
1. User enters credentials
2. 2FA verification (SMS/TOTP)
3. JWT token issued
4. Stellar account linking
5. Session management

### **Security Headers**
- Content Security Policy (CSP)
- HSTS (HTTP Strict Transport Security)
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff

### **Data Protection**
- Input sanitization
- XSS prevention
- CSRF protection
- Rate limiting

---

## 📊 Performance

### **Core Web Vitals Targets**
- **LCP:** <2.5s (Largest Contentful Paint)
- **FID:** <100ms (First Input Delay)  
- **CLS:** <0.1 (Cumulative Layout Shift)

### **Optimization Techniques**
- Image optimization with Next.js Image
- Code splitting and lazy loading
- Service worker for offline support
- CDN for static assets

---

## 🤝 Contributing

### **Development Workflow**
1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Make changes and add tests
4. Run linting: `npm run lint:fix`
5. Run tests: `npm run test`
6. Commit changes: `git commit -m 'Add amazing feature'`
7. Push to branch: `git push origin feature/amazing-feature`
8. Create Pull Request

### **Code Standards**
- Follow ESLint configuration
- Use Prettier for formatting
- Write tests for new features
- Update documentation

---

## 📈 Analytics & Monitoring

### **Integrated Services**
- **Google Analytics 4** - User behavior tracking
- **Sentry** - Error monitoring and performance
- **LogRocket** - Session replay and debugging
- **Hotjar** - User experience insights

### **Custom Metrics**
- Transaction completion rates
- User onboarding funnel
- Feature adoption rates
- Performance benchmarks

---

## 🔗 Resources

- **📖 Next.js Docs:** [https://nextjs.org/docs](https://nextjs.org/docs)
- **🎨 Figma Design:** [StellarBank Design System](https://figma.com/stellarbank)
- **📊 Storybook:** [Component Library](https://storybook.stellarbank.io)
- **🔍 API Docs:** [Backend API Documentation](../backend/README.md)

---

## 📄 License

MIT License - see [LICENSE](../LICENSE) file for details.

---

<div align="center">

**Built with ❤️ by the StellarBank Team**

*Empowering financial inclusion through innovative UI/UX*

</div>