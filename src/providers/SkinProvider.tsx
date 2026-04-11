'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { SkinType } from '@/types';

interface SkinContextType {
  skin: SkinType;
  setSkin: (skin: SkinType) => void;
  skinLabel: string;
}

const SkinContext = createContext<SkinContextType>({
  skin: 'akademi',
  setSkin: () => {},
  skinLabel: 'Akademi',
});

const VALID_SKINS: SkinType[] = ['akademi', 'mading', 'prestasi', 'emerald', 'sunset', 'midnight'];

const skinLabels: Record<SkinType, string> = {
  akademi: 'Akademi',
  mading: 'Mading',
  prestasi: 'Prestasi',
  emerald: 'Emerald',
  sunset: 'Sunset',
  midnight: 'Midnight',
};

export function SkinProvider({ children }: { children: React.ReactNode }) {
  // Read from DOM attribute first (set by inline script) to avoid FOUC
  const [skin, setSkinState] = useState<SkinType>(() => {
    if (typeof window !== 'undefined') {
      const domSkin = document.documentElement.getAttribute('data-skin') as SkinType;
      if (domSkin && VALID_SKINS.includes(domSkin)) {
        return domSkin;
      }
    }
    return 'akademi';
  });

  const setSkin = useCallback((newSkin: SkinType) => {
    setSkinState(newSkin);
    localStorage.setItem('school-skin', newSkin);
    document.documentElement.setAttribute('data-skin', newSkin);
  }, []);

  useEffect(() => {
    // Sync state with localStorage on mount (covers SSR mismatch)
    const saved = localStorage.getItem('school-skin') as SkinType;
    if (saved && VALID_SKINS.includes(saved)) {
      setSkinState(saved);
      document.documentElement.setAttribute('data-skin', saved);
    }
  }, []);

  return (
    <SkinContext.Provider value={{ skin, setSkin, skinLabel: skinLabels[skin] }}>
      {children}
    </SkinContext.Provider>
  );
}

export function useSkin() {
  return useContext(SkinContext);
}
