'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useSkin } from '@/providers/SkinProvider';
import { SkinType } from '@/types';
import { Palette, BookOpen, Trophy, X, Sparkles, Leaf, Sun, Moon } from 'lucide-react';
import { useState } from 'react';

const skins: { key: SkinType; label: string; icon: React.ReactNode; desc: string; colors: string[] }[] = [
  {
    key: 'akademi',
    label: 'Akademi',
    icon: <BookOpen className="h-4 w-4" />,
    desc: 'Formal & elegan',
    colors: ['#1e40af', '#3b82f6', '#059669'],
  },
  {
    key: 'mading',
    label: 'Mading',
    icon: <Sparkles className="h-4 w-4" />,
    desc: 'Colorful & ceria',
    colors: ['#7c3aed', '#ec4899', '#f59e0b'],
  },
  {
    key: 'prestasi',
    label: 'Prestasi',
    icon: <Trophy className="h-4 w-4" />,
    desc: 'Bold & dinamis',
    colors: ['#dc2626', '#eab308', '#16a34a'],
  },
  {
    key: 'emerald',
    label: 'Emerald',
    icon: <Leaf className="h-4 w-4" />,
    desc: 'Segar & natural',
    colors: ['#047857', '#10b981', '#0891b2'],
  },
  {
    key: 'sunset',
    label: 'Sunset',
    icon: <Sun className="h-4 w-4" />,
    desc: 'Hangat & vibrant',
    colors: ['#ea580c', '#fb923c', '#e11d48'],
  },
  {
    key: 'midnight',
    label: 'Midnight',
    icon: <Moon className="h-4 w-4" />,
    desc: 'Dark & elegan',
    colors: ['#4338ca', '#6366f1', '#06b6d4'],
  },
];

export default function SkinSwitcher() {
  const { skin, setSkin } = useSkin();
  const [open, setOpen] = useState(false);
  const panelWidth = 'min(280px, calc(100vw - 2rem))';

  return (
    <div className="fixed bottom-4 left-4 sm:bottom-6 sm:left-6 z-50">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="absolute bottom-16 left-0 glass-card rounded-2xl shadow-2xl p-4"
            style={{ width: panelWidth, maxWidth: panelWidth }}
          >
            <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--skin-text-muted)' }}>
              Pilih Tampilan
            </p>
            <div className="grid grid-cols-2 gap-2">
              {skins.map((s) => (
                <button
                  key={s.key}
                  onClick={() => {
                    setSkin(s.key);
                    setOpen(false);
                  }}
                  className={`flex flex-col items-center gap-1.5 px-3 py-3 rounded-xl text-center transition-all ${
                    skin === s.key
                      ? 'ring-2 shadow-md'
                      : 'hover:bg-black/5'
                  }`}
                  style={
                    skin === s.key
                      ? { background: 'var(--skin-surface)', outline: '2px solid var(--skin-primary)', outlineOffset: '0px' }
                      : {}
                  }
                >
                  <div className="flex -space-x-1">
                    {s.colors.map((c, i) => (
                      <div
                        key={i}
                        className="w-4 h-4 rounded-full border-2 border-white"
                        style={{ background: c }}
                      />
                    ))}
                  </div>
                  <div>
                    <p className="text-xs font-semibold" style={{ color: 'var(--skin-text-heading)' }}>
                      {s.label}
                    </p>
                    <p className="text-[9px] leading-tight" style={{ color: 'var(--skin-text-muted)' }}>
                      {s.desc}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen(!open)}
        className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl text-white shadow-xl flex items-center justify-center"
        style={{ background: 'linear-gradient(135deg, var(--skin-primary), var(--skin-accent))' }}
        aria-label="Ganti tampilan"
      >
        {open ? <X className="h-4 w-4 sm:h-5 sm:w-5" /> : <Palette className="h-4 w-4 sm:h-5 sm:w-5" />}
      </motion.button>
    </div>
  );
}
