import React, { createContext, useCallback, useContext, useState, ReactNode } from 'react';
import { saveAvatarIdDB } from '../lib/database';
import {
  AVATAR_OPTIONS,
  getDefaultAvatarIdForWallet,
  isValidAvatarId,
} from '../lib/avatars';

const STORAGE_KEY = 'nexora_avatar_seed_v2';

function cacheKeyForWallet(walletAddress?: string) {
  return walletAddress ? `${STORAGE_KEY}_${walletAddress.toLowerCase()}` : STORAGE_KEY;
}

function loadCachedAvatarId(walletAddress?: string): string | null {
  try {
    const walletCached = walletAddress ? localStorage.getItem(cacheKeyForWallet(walletAddress)) : null;
    if (isValidAvatarId(walletCached)) return walletCached;
    if (walletAddress) return null;

    const cached = localStorage.getItem(STORAGE_KEY);
    return isValidAvatarId(cached) ? cached : null;
  } catch {
    return null;
  }
}

function cacheAvatarId(avatarId: string, walletAddress?: string) {
  try {
    localStorage.setItem(STORAGE_KEY, avatarId);
    if (walletAddress) {
      localStorage.setItem(cacheKeyForWallet(walletAddress), avatarId);
    }
  } catch {
    // ignore
  }
}

interface AvatarContextType {
  avatarId: string;
  avatarSeed: string;
  setAvatarId: (avatarId: string, walletAddress?: string) => void;
  setAvatarSeed: (avatarId: string, walletAddress?: string) => void;
  hydrateAvatarForWallet: (walletAddress: string, savedAvatarId?: string | null) => void;
  assignDefaultIfMissing: (walletAddress: string) => void;
}

const AvatarContext = createContext<AvatarContextType | null>(null);

export const AvatarProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [avatarId, setAvatarIdState] = useState<string>(() => loadCachedAvatarId() ?? AVATAR_OPTIONS[0].id);

  const persistAvatarId = useCallback((nextAvatarId: string, walletAddress?: string) => {
    if (!isValidAvatarId(nextAvatarId)) return;
    setAvatarIdState(nextAvatarId);
    cacheAvatarId(nextAvatarId, walletAddress);
    if (walletAddress) {
      void saveAvatarIdDB(walletAddress, nextAvatarId);
    }
  }, []);

  const hydrateAvatarForWallet = useCallback((walletAddress: string, savedAvatarId?: string | null) => {
    if (isValidAvatarId(savedAvatarId)) {
      setAvatarIdState(savedAvatarId);
      cacheAvatarId(savedAvatarId, walletAddress);
      return;
    }

    const cachedAvatarId = loadCachedAvatarId(walletAddress);
    if (cachedAvatarId) {
      setAvatarIdState(cachedAvatarId);
      cacheAvatarId(cachedAvatarId, walletAddress);
      void saveAvatarIdDB(walletAddress, cachedAvatarId);
      return;
    }

    const defaultAvatarId = getDefaultAvatarIdForWallet(walletAddress);
    setAvatarIdState(defaultAvatarId);
    cacheAvatarId(defaultAvatarId, walletAddress);
    void saveAvatarIdDB(walletAddress, defaultAvatarId);
  }, []);

  const assignDefaultIfMissing = useCallback((walletAddress: string) => {
    hydrateAvatarForWallet(walletAddress, loadCachedAvatarId(walletAddress));
  }, [hydrateAvatarForWallet]);

  return (
    <AvatarContext.Provider
      value={{
        avatarId,
        avatarSeed: avatarId,
        setAvatarId: persistAvatarId,
        setAvatarSeed: persistAvatarId,
        hydrateAvatarForWallet,
        assignDefaultIfMissing,
      }}
    >
      {children}
    </AvatarContext.Provider>
  );
};

export const useAvatar = () => {
  const ctx = useContext(AvatarContext);
  if (!ctx) throw new Error('useAvatar must be inside AvatarProvider');
  return ctx;
};
