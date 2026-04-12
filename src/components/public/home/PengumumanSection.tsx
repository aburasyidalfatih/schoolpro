'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, AlertTriangle, Bell, Info } from 'lucide-react';
import SectionTitle from '@/components/public/shared/SectionTitle';

interface PengumumanCardItem {
  id: number | string;
  slug: string;
  title: string;
  date: string | Date;
  summary?: string;
  content?: string;
  priority: string;
}

const priorityConfig: Record<string, { icon: React.ReactNode; bg: string; border: string; text: string; label: string }> = {
  urgent: { icon: <AlertTriangle className="h-4 w-4" />, bg: '#fef2f2', border: '#fecaca', text: '#dc2626', label: 'Penting' },
  normal: { icon: <Bell className="h-4 w-4" />, bg: '#eff6ff', border: '#bfdbfe', text: '#2563eb', label: 'Normal' },
  info: { icon: <Info className="h-4 w-4" />, bg: '#f0fdf4', border: '#bbf7d0', text: '#16a34a', label: 'Info' },
};

function getAnnouncementPreview(summary = '', content = '') {
  const baseText = [content, summary]
    .filter(Boolean)
    .join(' ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!baseText) return '';

  const normalized = baseText
    .replace(/([.!?])\s+/g, '$1|')
    .split('|')
    .map((sentence) => sentence.trim())
    .filter(Boolean);

  if (normalized.length >= 2) {
    return normalized.slice(0, 2).join(' ');
  }

  if (baseText.length > 220) {
    return `${baseText.slice(0, 220).trim()}...`;
  }

  return baseText;
}

export default function PengumumanSection({ latestPengumuman }: { latestPengumuman: PengumumanCardItem[] }) {

  return (
    <section
      className="py-16 lg:py-24 px-4 sm:px-6 lg:px-8"
      style={{ background: 'var(--skin-section-alt)' }}
    >
      <div className="max-w-7xl mx-auto">
        <SectionTitle
          title="Pengumuman Terbaru"
          subtitle="Informasi penting dan pemberitahuan resmi dari Pesantren Putri Syech Ahmad Khatib"
        />

        <div className="grid sm:grid-cols-2 gap-4 lg:gap-6">
          {latestPengumuman.map((item, i) => {
            const config = priorityConfig[item.priority] || priorityConfig.normal;
            const preview = getAnnouncementPreview(item.summary, item.content);
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <Link href={`/pengumuman/${item.slug}`} className="block group h-full">
                  <div className="h-full bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all p-5 sm:p-6 border"
                    style={{ borderColor: 'var(--skin-border)' }}>
                    <div className="flex items-center gap-2 mb-3">
                      <span
                        className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full"
                        style={{ background: config.bg, color: config.text, border: `1px solid ${config.border}` }}
                      >
                        {config.icon} {config.label}
                      </span>
                      <span className="text-xs" style={{ color: 'var(--skin-text-muted)' }}>
                        {new Date(item.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </span>
                    </div>
                    <h3 className="text-base sm:text-lg font-bold mb-2 group-hover:underline decoration-2 underline-offset-4 line-clamp-2"
                      style={{ color: 'var(--skin-text-heading)' }}>
                      {item.title}
                    </h3>
                    {preview && (
                      <p className="text-sm leading-relaxed line-clamp-5" style={{ color: 'var(--skin-text-muted)' }}>
                        {preview}
                      </p>
                    )}
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        <div className="text-center mt-8">
          <Link
            href="/pengumuman"
            className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold rounded-xl border-2 transition-all hover:shadow-lg"
            style={{ borderColor: 'var(--skin-primary)', color: 'var(--skin-primary)' }}
          >
            Lihat Semua Pengumuman
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
