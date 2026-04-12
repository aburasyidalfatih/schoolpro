'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { MapPin, Clock, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import SectionTitle from '@/components/public/shared/SectionTitle';

interface AgendaItem {
  id: string | number;
  slug: string;
  title: string;
  date: string;
  time: string;
  location: string;
  category: string;
  image?: string | null;
}

const categoryColors: Record<string, string> = {
  ujian: '#dc2626',
  rapat: '#2563eb',
  libur: '#16a34a',
  kegiatan: '#d97706',
  lainnya: '#64748b',
};

export default function AgendaSection({ agenda = [] }: { agenda: AgendaItem[] }) {
  const latestAgenda = agenda.slice(0, 5);
  const sectionRef = useRef<HTMLElement>(null);
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isInView, setIsInView] = useState(false);
  const itemsPerPage = 2;
  const totalPages = Math.ceil(latestAgenda.length / itemsPerPage);

  const next = () => {
    if (totalPages <= 1) return;
    setDirection(1);
    setCurrent((prev) => (prev + 1) % totalPages);
  };

  const prev = () => {
    if (totalPages <= 1) return;
    setDirection(-1);
    setCurrent((prev) => (prev - 1 + totalPages) % totalPages);
  };

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsInView(entry.isIntersecting),
      { threshold: 0.35 }
    );

    observer.observe(section);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (totalPages <= 1 || !isInView) return;

    const timer = window.setInterval(() => {
      setDirection(1);
      setCurrent((prev) => (prev + 1) % totalPages);
    }, 5000);

    return () => window.clearInterval(timer);
  }, [isInView, totalPages]);

  if (totalPages === 0) return null;

  const currentItems = latestAgenda.slice(
    current * itemsPerPage,
    current * itemsPerPage + itemsPerPage
  );

  const variants = {
    enter: (slideDirection: number) => ({ x: slideDirection > 0 ? 300 : -300, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (slideDirection: number) => ({ x: slideDirection > 0 ? -300 : 300, opacity: 0 }),
  };

  return (
    <section
      ref={sectionRef}
      className="py-16 lg:py-24 px-4 sm:px-6 lg:px-8"
      style={{ background: 'linear-gradient(to bottom, var(--skin-surface) 0%, transparent 100%)' }}
    >
      <div className="max-w-7xl mx-auto">
        <SectionTitle
          title="Agenda Kegiatan"
          subtitle="Jadwal kegiatan dan acara yang akan datang di Pesantren Putri Syech Ahmad Khatib"
        />

        <div className="max-w-5xl mx-auto relative">
          {totalPages > 1 && (
            <>
              <button
                onClick={prev}
                className="hidden md:flex absolute -left-4 lg:-left-14 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-xl border-2 items-center justify-center transition-all hover:shadow-md focus-visible:outline-2 backdrop-blur-md"
                style={{ borderColor: 'var(--skin-primary)', color: 'var(--skin-primary)', background: 'var(--skin-card-bg)' }}
                aria-label="Agenda sebelumnya"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={next}
                className="hidden md:flex absolute -right-4 lg:-right-14 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-xl items-center justify-center text-white transition-all hover:shadow-md focus-visible:outline-2"
                style={{ background: 'linear-gradient(135deg, var(--skin-primary), var(--skin-primary-light))' }}
                aria-label="Agenda berikutnya"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}

          <div className="relative overflow-hidden min-h-[200px]">
          <AnimatePresence custom={direction} mode="wait">
            <motion.div
              key={current}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
              className="grid gap-4 lg:gap-6 sm:grid-cols-2"
            >
              {currentItems.map((item) => (
                <Link key={item.id} href={`/agenda/${item.slug}`} className="block group min-w-0">
                  <div
                    className="flex items-stretch gap-4 rounded-2xl shadow-sm hover:shadow-lg transition-all overflow-hidden border min-w-0 backdrop-blur-md"
                    style={{ borderColor: 'var(--skin-border)', background: 'var(--skin-card-bg)' }}
                  >
                    <div
                      className="flex-shrink-0 w-20 sm:w-28 flex flex-col items-center justify-center text-white p-3 sm:p-4"
                      style={{ background: `linear-gradient(135deg, ${categoryColors[item.category]}, ${categoryColors[item.category]}cc)` }}
                    >
                      <span className="text-2xl sm:text-4xl font-bold">
                        {new Date(item.date).getDate()}
                      </span>
                      <span className="text-[10px] sm:text-xs font-medium uppercase mt-0.5">
                        {new Date(item.date).toLocaleString('id-ID', { month: 'short' })}
                      </span>
                      <span className="text-[9px] sm:text-[10px] opacity-80">
                        {new Date(item.date).getFullYear()}
                      </span>
                    </div>

                    <div className="min-w-0 flex-1 py-4 pr-4 sm:pr-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <span
                            className="inline-block text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full text-white mb-2"
                            style={{ background: categoryColors[item.category] }}
                          >
                            {item.category}
                          </span>
                          <h3
                            className="text-base sm:text-lg font-bold group-hover:underline decoration-2 underline-offset-4 break-words"
                            style={{ color: 'var(--skin-text-heading)' }}
                          >
                            {item.title}
                          </h3>
                          <div className="flex flex-col sm:flex-row sm:flex-wrap gap-x-4 gap-y-1 mt-2 text-[10px] sm:text-sm min-w-0" style={{ color: 'var(--skin-text-muted)' }}>
                            <span className="flex items-center gap-1.5 min-w-0 break-words">
                              <Clock className="h-3 w-3 sm:h-3.5 sm:w-3.5" /> {item.time}
                            </span>
                            <span className="flex items-center gap-1.5 min-w-0 break-words">
                              <MapPin className="h-3 w-3 sm:h-3.5 sm:w-3.5" /> {item.location}
                            </span>
                          </div>
                        </div>
                        <ArrowRight
                          className="hidden sm:block h-5 w-5 flex-shrink-0 mt-2 opacity-0 group-hover:opacity-100 transition-opacity"
                          style={{ color: 'var(--skin-primary)' }}
                        />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </motion.div>
          </AnimatePresence>
          </div>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 mt-6">
            <div className="hidden md:flex gap-1.5">
              {Array.from({ length: totalPages }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setDirection(index > current ? 1 : -1);
                    setCurrent(index);
                  }}
                  className="h-2 rounded-full transition-all duration-300"
                  style={{
                    width: index === current ? '1.5rem' : '0.5rem',
                    background: index === current ? 'var(--skin-primary)' : 'var(--skin-border)',
                  }}
                  aria-label={`Halaman ${index + 1}`}
                />
              ))}
            </div>
            <div className="flex items-center justify-center gap-3 md:hidden">
              <button
                onClick={prev}
                className="w-10 h-10 rounded-xl border-2 flex items-center justify-center transition-all focus-visible:outline-2 backdrop-blur-md"
                style={{ borderColor: 'var(--skin-primary)', color: 'var(--skin-primary)', background: 'var(--skin-card-bg)' }}
                aria-label="Agenda sebelumnya"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <span className="text-xs font-medium" style={{ color: 'var(--skin-text-muted)' }}>
                {current + 1} / {totalPages}
              </span>
              <button
                onClick={next}
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white transition-all focus-visible:outline-2"
                style={{ background: 'linear-gradient(135deg, var(--skin-primary), var(--skin-primary-light))' }}
                aria-label="Agenda berikutnya"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
            <span className="hidden md:inline text-xs font-medium" style={{ color: 'var(--skin-text-muted)' }}>
              {current + 1} / {totalPages}
            </span>
          </div>
        )}

        <div className="text-center mt-8">
          <Link
            href="/agenda"
            className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold rounded-xl border-2 transition-all hover:shadow-lg"
            style={{ borderColor: 'var(--skin-primary)', color: 'var(--skin-primary)' }}
          >
            Lihat Semua Agenda
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
