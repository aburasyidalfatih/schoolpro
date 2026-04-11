'use client';

import { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, ArrowLeft, Trophy, Medal, ChevronLeft, ChevronRight } from 'lucide-react';
import SectionTitle from '@/components/website/shared/SectionTitle';
import { Badge } from '@/components/website/shared/Badge';
interface PrestasiItem {
  id: number;
  slug: string;
  title: string;
  date: string;
  level: string;
  category: string;
  student: string;
  achievement: string;
  image?: string | null;
}

const levelColors: Record<string, string> = {
  kota: '#64748b',
  provinsi: '#2563eb',
  nasional: '#d97706',
  internasional: '#dc2626',
};

export default function PrestasiSection({ prestasi = [] }: { prestasi: PrestasiItem[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    checkScroll();
    el.addEventListener('scroll', checkScroll, { passive: true });
    window.addEventListener('resize', checkScroll);
    return () => {
      el.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    const firstCard = el.firstElementChild as HTMLElement | null;
    const cardWidth = firstCard?.clientWidth || 340;
    el.scrollBy({
      left: direction === 'left' ? -(cardWidth + 20) : cardWidth + 20,
      behavior: 'smooth',
    });
  };

  if (prestasi.length === 0) return null;

  return (
    <section className="py-16 lg:py-24 overflow-hidden" style={{ background: 'var(--skin-surface)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionTitle
          title="Prestasi Gemilang"
          subtitle="Catatan kebanggaan santriwati kami di berbagai kompetisi dan kejuaraan"
        />

      </div>

      {/* Horizontal scroll container */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => scroll('left')}
          disabled={!canScrollLeft}
          className="hidden md:flex absolute -left-0 lg:-left-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-xl border-2 items-center justify-center transition-all hover:shadow-md focus-visible:outline-2 disabled:opacity-30 disabled:cursor-not-allowed"
          style={{ borderColor: 'var(--skin-primary)', color: 'var(--skin-primary)', background: 'white' }}
          aria-label="Prestasi sebelumnya"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          onClick={() => scroll('right')}
          disabled={!canScrollRight}
          className="hidden md:flex absolute -right-0 lg:-right-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-xl items-center justify-center text-white transition-all hover:shadow-md focus-visible:outline-2 disabled:opacity-30 disabled:cursor-not-allowed"
          style={{ background: 'linear-gradient(135deg, var(--skin-primary), var(--skin-primary-light))' }}
          aria-label="Prestasi berikutnya"
        >
          <ChevronRight className="h-5 w-5" />
        </button>

        {/* Gradient fade edges */}
        {canScrollLeft && (
          <div className="absolute left-0 top-0 bottom-0 w-16 z-10 pointer-events-none"
            style={{ background: 'linear-gradient(to right, var(--skin-surface, #f8fafc), transparent)' }} />
        )}
        {canScrollRight && (
          <div className="absolute right-0 top-0 bottom-0 w-16 z-10 pointer-events-none"
            style={{ background: 'linear-gradient(to left, var(--skin-surface, #f8fafc), transparent)' }} />
        )}

        <div
          ref={scrollRef}
          className="flex gap-4 sm:gap-5 overflow-x-auto scrollbar-hide pb-4 pl-1 pr-5 sm:pr-0 snap-x snap-mandatory"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          {prestasi.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-20px' }}
              transition={{ duration: 0.4, delay: Math.min(i * 0.08, 0.4) }}
              className="flex-shrink-0 w-[85vw] max-w-[300px] sm:w-[340px] sm:max-w-none snap-start"
            >
              <Link href={`/prestasi/${item.slug}`} className="block group h-full">
                <div className="h-full bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all overflow-hidden border"
                  style={{ borderColor: 'var(--skin-border)' }}>
                  {/* Image */}
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={item.image || ''}
                      alt={item.title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3">
                      <span
                        className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full text-white shadow-lg"
                        style={{ background: levelColors[item.level] }}
                      >
                        <Trophy className="h-3 w-3" />
                        {item.level}
                      </span>
                    </div>
                    <div className="absolute bottom-3 right-3">
                      <span className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-full bg-white/90 backdrop-blur shadow-md"
                        style={{ color: levelColors[item.level] }}>
                        <Medal className="h-3.5 w-3.5" />
                        {item.achievement}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <p className="text-xs mb-2" style={{ color: 'var(--skin-text-muted)' }}>
                      {new Date(item.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                    <h3 className="text-base font-bold mb-2 line-clamp-2 group-hover:underline decoration-2 underline-offset-4"
                      style={{ color: 'var(--skin-text-heading)' }}>
                      {item.title}
                    </h3>
                    <p className="text-sm font-medium mb-2 line-clamp-1" style={{ color: 'var(--skin-primary)' }}>
                      {item.student}
                    </p>
                    <Badge variant="secondary" className="text-[10px]">{item.category}</Badge>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}

          {/* "Lihat Semua" card at the end */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.5 }}
            className="flex-shrink-0 w-[85vw] max-w-[300px] sm:w-[340px] sm:max-w-none snap-start"
          >
            <Link href="/prestasi" className="block h-full">
              <div className="h-full rounded-2xl flex flex-col items-center justify-center p-8 transition-all hover:shadow-xl border-2 border-dashed"
                style={{ borderColor: 'var(--skin-primary)', background: 'var(--skin-surface)' }}>
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-lg mb-4"
                  style={{ background: 'linear-gradient(135deg, var(--skin-primary), var(--skin-primary-light))' }}
                >
                  <Trophy className="h-8 w-8" />
                </div>
                <p className="text-lg font-bold mb-1" style={{ color: 'var(--skin-text-heading)' }}>
                  Lihat Semua
                </p>
                <p className="text-sm mb-4" style={{ color: 'var(--skin-text-muted)' }}>
                  {prestasi.length}+ Prestasi
                </p>
                <div className="inline-flex items-center gap-2 text-sm font-semibold"
                  style={{ color: 'var(--skin-primary)' }}>
                  Selengkapnya <ArrowRight className="h-4 w-4" />
                </div>
              </div>
            </Link>
          </motion.div>
        </div>
      </div>

      <div className="flex items-center justify-center gap-4 mt-6">
        <div className="flex items-center justify-center gap-3 md:hidden">
          <button
            onClick={() => scroll('left')}
            disabled={!canScrollLeft}
            className="w-10 h-10 rounded-xl border-2 flex items-center justify-center transition-all focus-visible:outline-2 disabled:opacity-30 disabled:cursor-not-allowed"
            style={{ borderColor: 'var(--skin-primary)', color: 'var(--skin-primary)', background: 'white' }}
            aria-label="Prestasi sebelumnya"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <span className="text-xs font-medium" style={{ color: 'var(--skin-text-muted)' }}>
            Geser kartu
          </span>
          <button
            onClick={() => scroll('right')}
            disabled={!canScrollRight}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white transition-all focus-visible:outline-2 disabled:opacity-30 disabled:cursor-not-allowed"
            style={{ background: 'linear-gradient(135deg, var(--skin-primary), var(--skin-primary-light))' }}
            aria-label="Prestasi berikutnya"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </section>
  );
}
