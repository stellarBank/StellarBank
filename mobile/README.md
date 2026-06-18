# 📱 StellarBank Mobile App

> Native mobile application for cross-border remittance powered by React Native and Stellar blockchain

[![React Native](https://img.shields.io/badge/React%20Native-0.73%2B-blue)](https://reactnative.dev)
[![iOS](https://img.shields.io/badge/iOS-12%2B-black)](https://developer.apple.com/ios/)
[![Android](https://img.shields.io/badge/Android-7%2B-green)](https://developer.android.com)
[![Stellar](https://img.shields.io/badge/Stellar-SDK-brightgreen)](https://stellar.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3%2B-blue)](https://typescriptlang.org)

## 🌍 Targeting Emerging Markets

StellarBank Mobile is specifically designed for users in emerging markets, with focus on:

- 🇳🇬 **Nigeria** - Leading remittance recipient in Africa
- 🇬🇭 **Ghana** - Growing digital payment adoption
- 🇰🇪 **Kenya** - M-Pesa integration and mobile money
- 🇺🇬 **Uganda** - Cross-border trade with neighbors
- 🇿🇦 **South Africa** - Regional financial hub

### **Key Remittance Corridors**
- Nigeria ↔ USA ($6.1B annually)
- Nigeria ↔ UK ($3.2B annually) 
- Ghana ↔ USA ($2.1B annually)
- Kenya ↔ UAE ($1.8B annually)
- South Africa ↔ Europe ($1.4B annually)

---

## 🌟 Features

### 💸 **Instant Remittance**
- Send money across borders in seconds
- Real-time exchange rates
- Minimal fees (0.5% vs 8-12% traditional)
- Multi-currency support (USD, EUR, GBP, NGN, GHS, KES)

### 🏪 **Cash-Out Network**
- 50,000+ agent locations across Africa
- Mobile money integration (MTN, Airtel, Safaricom)
- Bank transfer support
- Crypto wallet withdrawals

### 🔐 **Security & Privacy**
- Biometric authentication (Touch ID, Face ID)
- End-to-end encrypted communications
- Multi-factor authentication
- Offline transaction signing

### 📱 **Mobile-First Design**
- Works on low-end Android devices (2GB RAM+)
- Optimized for slow networks (2G/3G)
- Offline-first architecture
- Local language support

### 🎯 **User Experience**
- Simplified onboarding (2 minutes)
- Visual transaction tracking
- QR code payments
- Voice-guided assistance

---

## 🚀 Quick Start

### Prerequisites
```bash
# Required
Node.js 16+
React Native CLI
Android Studio (for Android)
Xcode (for iOS - macOS only)

# Optional
Java 11+ (for Android)
CocoaPods (for iOS dependencies)
```

### Installation
```bash
# Clone repository
git clone https://github.com/presidojay1/StellarBank.git
cd StellarBank/mobile

# Install dependencies
npm install

# iOS setup (macOS only)
cd ios && pod install && cd ..

# Android setup
# Open Android Studio and sync project
# Ensure Android SDK 28+ is installed
```

### Development
```bash
# Start Metro bundler
npm start

# Run on Android
npm run android

# Run on iOS (macOS only)
npm run ios

# Run tests
npm test

# Type checking
npm run type-check
```

---

## 🏗️ Project Structure

```
mobile/
├── 📁 android/               # Android native code
│   ├── app/
│   │   ├── src/main/
│   │   │   ├── java/         # Java/Kotlin code
│   │   │   └── res/          # Android resources
│   │   └── build.gradle      # App build config
│   └── build.gradle          # Project build config
├── 📁 ios/                   # iOS native code  
│   ├── StellarBank/          # iOS app bundle
│   ├── StellarBank.xcworkspace # Xcode workspace
│   └── Podfile               # CocoaPods dependencies
├── 📁 src/
│   ├── 📁 components/        # Reusable UI components
│   │   ├── buttons/          # Button components
│   │   ├── forms/            # Form components
│   │   ├── cards/            # Card components
│   │   └── charts/           # Chart components
│   ├── 📁 screens/           # App screens/pages
│   │   ├── auth/             # Authentication screens
│   │   ├── dashboard/        # Dashboard screens
│   │   ├── transfer/         # Transfer screens
│   │   └── settings/         # Settings screens
│   ├── 📁 navigation/        # Navigation configuration
│   ├── 📁 services/          # API and business logic
│   │   ├── api.service.ts    # HTTP API client
│   │   ├── stellar.service.ts # Stellar integration
│   │   ├── biometric.service.ts # Biometric auth
│   │   └── storage.service.ts # Local storage
│   ├── 📁 store/             # State management
│   │   ├── slices/           # Redux slices
│   │   └── index.ts          # Store configuration
│   ├── 📁 hooks/             # Custom React hooks
│   ├── 📁 utils/             # Utility functions
│   ├── 📁 constants/         # App constants
│   ├── 📁 types/             # TypeScript types
│   └── 📁 assets/            # Images, fonts, etc.
├── 📁 __tests__/             # Test files
├── 📁 e2e/                   # End-to-end tests
├── 📄 App.tsx                # Root component
├── 📄 index.js               # Entry point
└── 📄 package.json           # Dependencies
```

---

## 🛠️ Technology Stack

### **Core Framework**
- **React Native 0.73** - Cross-platform mobile framework
- **TypeScript 5.3** - Type-safe JavaScript
- **React Navigation 6** - Navigation library
- **React Native Paper** - Material Design components

### **State Management**
- **Redux Toolkit** - Predictable state management
- **React Query** - Server state management
- **Zustand** - Lightweight local state
- **Redux Persist** - State persistence

### **Blockchain Integration**
- **Stellar SDK** - Stellar blockchain interaction
- **Encrypted Storage** - Secure key storage
- **Biometric Authentication** - Hardware-based security
- **QR Code Integration** - Contactless payments

### **UI/UX Libraries**
- **React Native Reanimated** - Advanced animations
- **React Native Gesture Handler** - Touch gestures
- **React Native Linear Gradient** - Gradient backgrounds
- **React Native Vector Icons** - Icon library
- **React Native Fast Image** - Optimized image loading

### **Development Tools**
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Jest** - Unit testing
- **Detox** - E2E testing
- **Flipper** - Debugging platform

---

## 🎨 Design System

### **Color Palette**
```javascript
// colors.ts
export const Colors = {
  // Primary Brand Colors
  primary: '#1E40AF',        // Stellar Blue
  primaryLight: '#3B82F6',   // Light Blue
  primaryDark: '#1E3A8A',    // Dark Blue
  
  // Secondary Colors
  success: '#10B981',        // Green
  warning: '#F59E0B',        // Amber
  error: '#EF4444',          // Red
  info: '#06B6D4',          // Cyan
  
  // Neutral Colors
  white: '#FFFFFF',
  black: '#000000',
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray900: '#111827',
  
  // African Market Specific
  nairaGreen: '#008751',     // Nigeria
  ghanaGold: '#FFD700',      // Ghana
  kenyaRed: '#BB0000',       // Kenya
};
```

### **Typography Scale**
```javascript
// typography.ts
export const Typography = {
  // Font Families
  primary: 'Inter',          // Main UI font
  secondary: 'Roboto',       // Fallback font
  mono: 'JetBrains Mono',    // Numbers and codes
  
  // Font Sizes (sp - scale-independent pixels)
  xs: 12,    // Captions
  sm: 14,    // Body text
  base: 16,  // Base size
  lg: 18,    // Large text  
  xl: 20,    // Headings
  '2xl': 24, // Large headings
  '3xl': 30, // Display text
  '4xl': 36, // Hero text
};
```

### **Component Library**
All components follow the StellarBank Design System:
- **Consistent spacing** (8dp grid system)
- **Accessible touch targets** (44dp minimum)
- **High contrast ratios** (WCAG AA compliant)
- **Responsive breakpoints** for tablets

---

## 📱 Platform-Specific Features

### **iOS Implementation**
```swift
// iOS-specific features in native modules
@objc(BiometricAuth)
class BiometricAuth: NSObject {
  
  @objc
  func authenticateWithBiometrics(_ resolve: @escaping RCTPromiseResolveBlock, 
                                  reject: @escaping RCTPromiseRejectBlock) {
    let context = LAContext()
    let reason = "Authenticate to access your StellarBank wallet"
    
    context.evaluatePolicy(.biometryAny, localizedReason: reason) { success, error in
      DispatchQueue.main.async {
        if success {
          resolve(["success": true])
        } else {
          reject("AUTH_FAILED", error?.localizedDescription, error)
        }
      }
    }
  }
}
```

### **Android Implementation**
```kotlin
// Android-specific features
class BiometricAuthModule(reactContext: ReactApplicationContext) : 
    ReactContextBaseJavaModule(reactContext) {
    
    override fun getName() = "BiometricAuth"
    
    @ReactMethod
    fun authenticateWithBiometrics(promise: Promise) {
        val executor = ContextCompat.getMainExecutor(reactApplicationContext)
        val biometricPrompt = BiometricPrompt(
            reactApplicationContext as ComponentActivity,
            executor,
            object : BiometricPrompt.AuthenticationCallback() {
                override fun onAuthenticationSucceeded(result: BiometricPrompt.AuthenticationResult) {
                    super.onAuthenticationSucceeded(result)
                    promise.resolve(true)
                }
                
                override fun onAuthenticationError(errorCode: Int, errString: CharSequence) {
                    super.onAuthenticationError(errorCode, errString)
                    promise.reject("AUTH_FAILED", errString.toString())
                }
            }
        )
        
        val promptInfo = BiometricPrompt.PromptInfo.Builder()
            .setTitle("StellarBank Authentication")
            .setSubtitle("Use your fingerprint to access your wallet")
            .setNegativeButtonText("Cancel")
            .build()
            
        biometricPrompt.authenticate(promptInfo)
    }
}
```

---

## 🌍 Internationalization

### **Supported Languages**
- 🇺🇸 **English (en)** - Global default
- 🇫🇷 **French (fr)** - West Africa (Senegal, Côte d'Ivoire)
- 🇳🇬 **Hausa (ha)** - Northern Nigeria, Niger, Chad
- 🇳🇬 **Yoruba (yo)** - Southwest Nigeria, Benin
- 🇳🇬 **Igbo (ig)** - Southeast Nigeria
- 🇰🇪 **Swahili (sw)** - East Africa (Kenya, Tanzania, Uganda)
- 🇿🇦 **Zulu (zu)** - South Africa
- 🇬🇭 **Twi (tw)** - Ghana

### **Localization Setup**
```javascript
// i18n/index.ts
import {getLocales} from 'react-native-localize';
import {I18n} from 'i18n-js';

import en from './en.json';
import fr from './fr.json';
import ha from './ha.json';
import yo from './yo.json';
import ig from './ig.json';
import sw from './sw.json';

const i18n = new I18n({
  en,
  fr,
  ha,
  yo,
  ig,
  sw,
});

// Set locale based on device settings
const locales = getLocales();
if (Array.isArray(locales)) {
  i18n.locale = locales[0].languageCode;
}

i18n.fallbacks = true;
i18n.defaultLocale = 'en';

export default i18n;
```

### **Usage Example**
```javascript
// In components
import i18n from '../i18n';

const SendMoneyScreen = () => {
  return (
    <View>
      <Text>{i18n.t('send_money.title')}</Text>
      <Text>{i18n.t('send_money.enter_amount')}</Text>
      <Text>{i18n.t('common.continue')}</Text>
    </View>
  );
};
```

---

## 🔐 Security Implementation

### **Biometric Authentication**
```typescript
// services/biometric.service.ts
import TouchID from 'react-native-touch-id';

class BiometricService {
  async authenticate(): Promise<boolean> {
    try {
      const biometryType = await TouchID.isSupported();
      
      if (biometryType) {
        await TouchID.authenticate('Access your StellarBank wallet', {
          title: 'Authentication Required',
          imageColor: '#1E40AF',
          imageErrorColor: '#EF4444',
          sensorDescription: 'Touch sensor',
          sensorErrorDescription: 'Failed',
          cancelText: 'Cancel',
          fallbackLabel: 'Use Passcode',
          unifiedErrors: false,
          passcodeFallback: false,
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Biometric authentication failed:', error);
      return false;
    }
  }

  async checkAvailability(): Promise<string | null> {
    try {
      const biometryType = await TouchID.isSupported();
      return biometryType;
    } catch (error) {
      return null;
    }
  }
}

export default new BiometricService();
```

### **Secure Storage**
```typescript
// services/storage.service.ts
import EncryptedStorage from 'react-native-encrypted-storage';

class SecureStorageService {
  private prefix = '@StellarBank:';

  async setItem(key: string, value: string): Promise<void> {
    await EncryptedStorage.setItem(`${this.prefix}${key}`, value);
  }

  async getItem(key: string): Promise<string | null> {
    return await EncryptedStorage.getItem(`${this.prefix}${key}`);
  }

  async removeItem(key: string): Promise<void> {
    await EncryptedStorage.removeItem(`${this.prefix}${key}`);
  }

  async clear(): Promise<void> {
    await EncryptedStorage.clear();
  }

  // Stellar-specific methods
  async storeStellarKeypair(publicKey: string, secretKey: string): Promise<void> {
    await this.setItem('stellar_public_key', publicKey);
    await this.setItem('stellar_secret_key', secretKey);
  }

  async getStellarKeypair(): Promise<{publicKey: string; secretKey: string} | null> {
    const publicKey = await this.getItem('stellar_public_key');
    const secretKey = await this.getItem('stellar_secret_key');
    
    if (publicKey && secretKey) {
      return { publicKey, secretKey };
    }
    return null;
  }
}

export default new SecureStorageService();
```

---

## 🧪 Testing Strategy

### **Unit Tests**
```javascript
// __tests__/services/stellar.service.test.ts
import StellarService from '../../src/services/stellar.service';

describe('StellarService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should generate valid Stellar keypair', () => {
    const keypair = StellarService.generateKeypair();
    
    expect(keypair.publicKey).toMatch(/^G[A-Z0-9]{55}$/);
    expect(keypair.secretKey).toMatch(/^S[A-Z0-9]{55}$/);
  });

  test('should validate Stellar addresses', () => {
    const validAddress = 'GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX';
    const invalidAddress = 'invalid_address';
    
    expect(StellarService.isValidAddress(validAddress)).toBe(true);
    expect(StellarService.isValidAddress(invalidAddress)).toBe(false);
  });
});
```

### **Integration Tests**
```javascript
// __tests__/integration/transfer.flow.test.ts
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import SendMoneyScreen from '../../src/screens/transfer/SendMoneyScreen';

describe('Send Money Flow', () => {
  test('should complete transfer successfully', async () => {
    const { getByTestId, getByText } = render(<SendMoneyScreen />);
    
    // Enter recipient address
    fireEvent.changeText(
      getByTestId('recipient-input'),
      'GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX'
    );
    
    // Enter amount
    fireEvent.changeText(getByTestId('amount-input'), '100');
    
    // Select currency
    fireEvent.press(getByTestId('currency-selector'));
    fireEvent.press(getByText('USD'));
    
    // Submit transfer
    fireEvent.press(getByTestId('send-button'));
    
    // Wait for success message
    await waitFor(() => {
      expect(getByText('Transfer Successful')).toBeTruthy();
    });
  });
});
```

### **E2E Tests**
```javascript
// e2e/transfer.e2e.js
describe('Transfer Flow', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should complete end-to-end transfer', async () => {
    // Login
    await element(by.id('email-input')).typeText('test@example.com');
    await element(by.id('password-input')).typeText('password123');
    await element(by.id('login-button')).tap();
    
    // Navigate to send money
    await element(by.id('send-money-tab')).tap();
    
    // Complete transfer form
    await element(by.id('recipient-input')).typeText('GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX');
    await element(by.id('amount-input')).typeText('100');
    await element(by.id('send-button')).tap();
    
    // Verify success
    await expect(element(by.text('Transfer Successful'))).toBeVisible();
  });
});
```

---

## 📊 Performance Optimization

### **Bundle Size Optimization**
```javascript
// metro.config.js
const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');

const config = {
  transformer: {
    minifierConfig: {
      mangle: {
        keep_fnames: true,
      },
      output: {
        ascii_only: true,
        quote_keys: true,
        wrap_iife: true,
      },
      sourceMap: {
        includeSources: false,
      },
      toplevel: false,
      warnings: false,
    },
  },
  resolver: {
    alias: {
      '@': './src',
    },
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
```

### **Image Optimization**
```javascript
// components/OptimizedImage.tsx
import FastImage from 'react-native-fast-image';

interface OptimizedImageProps {
  source: string | { uri: string };
  style?: any;
  resizeMode?: 'contain' | 'cover' | 'stretch' | 'center';
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  source,
  style,
  resizeMode = 'cover',
}) => {
  return (
    <FastImage
      style={style}
      source={
        typeof source === 'string'
          ? { uri: source, priority: FastImage.priority.normal }
          : source
      }
      resizeMode={FastImage.resizeMode[resizeMode]}
    />
  );
};
```

### **Network Optimization**
```javascript
// services/api.service.ts
class ApiService {
  private cache = new Map();
  
  async request(url: string, options: RequestOptions = {}) {
    // Implement caching for GET requests
    if (options.method === 'GET' || !options.method) {
      const cached = this.cache.get(url);
      if (cached && Date.now() - cached.timestamp < 300000) { // 5 minutes
        return cached.data;
      }
    }
    
    // Add retry logic for network failures
    let attempts = 0;
    const maxAttempts = 3;
    
    while (attempts < maxAttempts) {
      try {
        const response = await fetch(url, {
          timeout: 10000, // 10 second timeout
          ...options,
        });
        
        const data = await response.json();
        
        // Cache successful GET responses
        if (response.ok && (options.method === 'GET' || !options.method)) {
          this.cache.set(url, { data, timestamp: Date.now() });
        }
        
        return data;
      } catch (error) {
        attempts++;
        if (attempts >= maxAttempts) throw error;
        
        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempts)));
      }
    }
  }
}
```

---

## 🚀 Build & Distribution

### **Android Release Build**
```bash
# Generate signed APK
cd android
./gradlew assembleRelease

# Generate signed AAB (recommended for Play Store)
./gradlew bundleRelease

# Install release APK for testing
adb install app/build/outputs/apk/release/app-release.apk
```

### **iOS Release Build**
```bash
# Archive for distribution
cd ios
xcodebuild -workspace StellarBank.xcworkspace \
  -scheme StellarBank \
  -configuration Release \
  -archivePath StellarBank.xcarchive \
  archive

# Export IPA
xcodebuild -exportArchive \
  -archivePath StellarBank.xcarchive \
  -exportPath ./export \
  -exportOptionsPlist exportOptions.plist
```

### **Code Signing Setup**
```bash
# iOS Certificate Management
# 1. Generate Certificate Signing Request (CSR)
# 2. Download certificates from Apple Developer Portal
# 3. Install certificates in Keychain Access
# 4. Configure provisioning profiles in Xcode

# Android Keystore Management
keytool -genkey -v -keystore stellarbank-release-key.keystore \
  -alias stellarbank-key-alias \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000
```

---

## 🤝 Contributing

### **Mobile Development Setup**
```bash
# Install React Native development tools
npm install -g @react-native-community/cli
npm install -g flipper

# iOS development (macOS only)
gem install cocoapods
# Install Xcode from App Store
# Install iOS simulators

# Android development
# Install Android Studio
# Install Android SDK 28+
# Set up Android emulators
```

### **Code Standards**
- Follow React Native best practices
- Use TypeScript for all new code
- Implement proper error boundaries
- Write tests for critical functionality
- Follow accessibility guidelines

---

## 📄 License

MIT License - see [LICENSE](../LICENSE) file for details.

---

<div align="center">

**Built with 📱 React Native and ❤️ by the StellarBank Mobile Team**

*Financial inclusion through mobile innovation*

</div>