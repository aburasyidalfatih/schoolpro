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

function resolveInitialSkin(): SkinType {
  if (typeof window !== 'undefined') {
    const domSkin = document.documentElement.getAttribute('data-skin');
    if (domSkin && VALID_SKINS.includes(domSkin as SkinType)) {
      return domSkin as SkinType;
    }

    const saved = localStorage.getItem('school-skin');
    if (saved && VALID_SKINS.includes(saved as SkinType)) {
      return saved as SkinType;
    }
  }

  return 'akademi';
}

export function SkinProvider({ children }: { children: React.ReactNode }) {
  const [skin, setSkinState] = useState<SkinType>(resolveInitialSkin);

  const setSkin = useCallback((newSkin: SkinType) => {
    setSkinState(newSkin);
    localStorage.setItem('school-skin', newSkin);
    document.documentElement.setAttribute('data-skin', newSkin);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-skin', skin);
  }, [skin]);

  return (
    <SkinContext.Provider value={{ skin, setSkin, skinLabel: skinLabels[skin] }}>
      {children}
    </SkinContext.Provider>
  );
}

export function useSkin() {
  return useContext(SkinContext);
}
