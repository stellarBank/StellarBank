import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  kycStatus: string;
  kycLevel: number;
}

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: AuthUser | null;
  walletPublicKey: string | null;
  hasHydrated: boolean;
  setSession: (accessToken: string, refreshToken: string, user: AuthUser) => void;
  setWallet: (publicKey: string | null) => void;
  setHasHydrated: (value: boolean) => void;
  logout: () => void;
}

// zustand's persist middleware reads localStorage asynchronously on mount,
// so on first render (and on every server-rendered pass) the store starts
// out empty even for an already-logged-in user. Auth-guard pages must wait
// for `hasHydrated` before redirecting, or they'll bounce a logged-in user
// to /auth/login for one render.
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      walletPublicKey: null,
      hasHydrated: false,
      setSession: (accessToken, refreshToken, user) => set({ accessToken, refreshToken, user }),
      setWallet: (walletPublicKey) => set({ walletPublicKey }),
      setHasHydrated: (hasHydrated) => set({ hasHydrated }),
      logout: () => set({ accessToken: null, refreshToken: null, user: null, walletPublicKey: null }),
    }),
    {
      name: 'stellarbank-auth',
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user,
        walletPublicKey: state.walletPublicKey,
      }),
    }
  )
);
