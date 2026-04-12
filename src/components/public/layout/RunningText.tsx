'use client';

import Link from 'next/link';
import { Megaphone } from 'lucide-react';

interface RunningItem {
  label: string;
  text: string;
  href: string;
}

export default function RunningText({ items = [] }: { items: RunningItem[] }) {
  if (items.length === 0) return null;

  const renderItems = (key: string) => (
    <span className="inline-flex items-center">
      {items.map((item, i) => (
        <Link
          key={`${key}-${i}`}
          href={item.href}
          className="inline-flex items-center gap-2 px-4 hover:underline underline-offset-2 transition-colors whitespace-nowrap"
        >
          <span
            className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-sm bg-white/15"
          >
            {item.label}
          </span>
          <span>{item.text}</span>
          {i < items.length - 1 && (
            <span className="ml-4 opacity-40">•</span>
          )}
        </Link>
      ))}
    </span>
  );

  return (
    <div
      className="w-full overflow-hidden py-2 text-sm font-light text-white relative"
      style={{ background: 'linear-gradient(90deg, var(--skin-primary-dark, #1e3a8a), var(--skin-primary, #1e40af))' }}
    >
      {/* Fade edges */}
      <div className="absolute left-16 top-0 bottom-0 w-8 z-10 pointer-events-none" 
        style={{ background: 'linear-gradient(to right, var(--skin-primary-dark), transparent)' }} />
      <div className="absolute right-0 top-0 bottom-0 w-8 z-10 pointer-events-none" 
        style={{ background: 'linear-gradient(to left, var(--skin-primary), transparent)' }} />
      <div className="flex items-center">
        <div className="flex-shrink-0 px-4 flex items-center gap-2 border-r border-white/20 z-10"
          style={{ background: 'var(--skin-primary-dark, #1e3a8a)' }}>
          <Megaphone className="h-4 w-4" />
          <span className="font-bold text-xs uppercase tracking-wider">Info</span>
        </div>
        <div className="flex-1 overflow-hidden relative">
          <div className="animate-marquee whitespace-nowrap flex items-center w-max">
            {renderItems('a')}
            {renderItems('b')}
          </div>
        </div>
      </div>
    </div>
  );
}
