'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, GraduationCap, ArrowRight } from 'lucide-react';
import SectionTitle from '@/components/public/shared/SectionTitle';
interface Guru {
  id: string | number;
  name: string;
  photo: string;
  jabatan: string;
  jabatanLabel: string;
  bidang: string;
  pendidikan: string;
  bio: string;
  quote?: string | null;
  nip?: string | null;
  orderIndex: number;
}

export default function GuruSection({ gurus = [] }: { gurus: Guru[] }) {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);

  // Show top 6 guru (sorted by orderIndex)
  const featured = [...gurus]
    .sort((a, b) => a.orderIndex - b.orderIndex)
    .slice(0, 6);
  const totalFeatured = featured.length;

  const next = () => {
    if (totalFeatured === 0) return;
    setDirection(1);
    setCurrent((prev) => (prev + 1) % totalFeatured);
  };

  const prev = () => {
    if (totalFeatured === 0) return;
    setDirection(-1);
    setCurrent((prev) => (prev - 1 + totalFeatured) % totalFeatured);
  };

  // Auto-slide
  useEffect(() => {
    if (totalFeatured <= 1) return;

    const timer = setInterval(() => {
      setDirection(1);
      setCurrent((prev) => (prev + 1) % totalFeatured);
    }, 5000);

    return () => clearInterval(timer);
  }, [totalFeatured]);

  if (totalFeatured === 0) return null;

  const guru = featured[current];

  const variants = {
    enter: (d: number) => ({ x: d > 0 ? 300 : -300, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d > 0 ? -300 : 300, opacity: 0 }),
  };

  const jabatanColors: Record<string, string> = {
    'kepala-pesantren': 'var(--skin-accent)',
    'wakil': 'var(--skin-secondary)',
    'guru': 'var(--skin-primary)',
    'pembina-asrama': 'var(--skin-primary-light)',
  };

  return (
    <section
      className="py-16 lg:py-24 px-4 sm:px-6 lg:px-8"
      style={{ background: 'var(--skin-section-alt)' }}
    >
      <div className="max-w-7xl mx-auto">
        <SectionTitle
          title="Guru Terbaik Kami"
          subtitle="Tenaga pendidik profesional dan berdedikasi yang membimbing santriwati dengan ilmu dan kasih sayang"
        />

        {/* Slider card */}
        <div className="max-w-5xl mx-auto relative">
          {/* Nav arrows */}
          <button
            onClick={prev}
            className="hidden md:flex absolute -left-4 lg:-left-14 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-xl border-2 items-center justify-center transition-all hover:shadow-md focus-visible:outline-2 backdrop-blur-md"
            style={{ borderColor: 'var(--skin-primary)', color: 'var(--skin-primary)', background: 'var(--skin-card-bg)' }}
            aria-label="Guru sebelumnya"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={next}
            className="hidden md:flex absolute -right-4 lg:-right-14 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-xl items-center justify-center text-white transition-all hover:shadow-md focus-visible:outline-2"
            style={{ background: 'linear-gradient(135deg, var(--skin-primary), var(--skin-primary-light))' }}
            aria-label="Guru berikutnya"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          <div className="overflow-hidden rounded-2xl">
            <AnimatePresence custom={direction} mode="wait">
              <motion.div
                key={guru.id}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                className="rounded-2xl shadow-lg border overflow-hidden backdrop-blur-md"
                style={{ borderColor: 'var(--skin-border)', background: 'var(--skin-card-bg)' }}
              >
                <div className="flex flex-col md:flex-row">
                  {/* Photo */}
                  <div className="relative w-full md:w-72 lg:w-80 h-72 md:h-auto flex-shrink-0">
                    <Image
                      src={guru.photo}
                      alt={guru.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 320px"
                    />
                    {/* Jabatan badge overlay */}
                    <div className="absolute bottom-3 left-3 md:bottom-4 md:left-4">
                      <span
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-white px-3 py-1.5 rounded-lg shadow-lg backdrop-blur"
                        style={{ background: jabatanColors[guru.jabatan] || 'var(--skin-primary)' }}
                      >
                        <GraduationCap className="h-3.5 w-3.5" />
                        {guru.jabatanLabel}
                      </span>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex-1 p-6 md:p-8 flex flex-col justify-center">
                    <h3 className="text-xl lg:text-2xl font-bold mb-1" style={{ color: 'var(--skin-text-heading)' }}>
                      {guru.name}
                    </h3>
                    <p className="text-sm font-medium mb-4" style={{ color: 'var(--skin-primary)' }}>
                      {guru.bidang}
                    </p>

                    {/* Education */}
                    <div className="flex items-start gap-2 mb-4 text-xs" style={{ color: 'var(--skin-text-muted)' }}>
                      <GraduationCap className="h-4 w-4 flex-shrink-0 mt-0.5" />
                      <span>{guru.pendidikan}</span>
                    </div>

                    {/* Bio */}
                    <p className="text-sm leading-relaxed mb-4 line-clamp-3" style={{ color: 'var(--skin-text-body)' }}>
                      {guru.bio}
                    </p>

                    {/* Quote */}
                    {guru.quote && (
                      <blockquote
                        className="text-sm italic pl-4 border-l-3 mb-4 line-clamp-2"
                        style={{ borderColor: 'var(--skin-accent)', color: 'var(--skin-text-muted)' }}
                      >
                        &ldquo;{guru.quote}&rdquo;
                      </blockquote>
                    )}

                    {/* NIP */}
                    {guru.nip && (
                      <p className="text-[11px] font-mono" style={{ color: 'var(--skin-text-muted)' }}>
                        NIP: {guru.nip}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Dots + counter */}
          <div className="flex items-center justify-center gap-4 mt-6">
            <div className="flex gap-1.5">
              {featured.map((_, i) => (
                <button
                  key={i}
                  onClick={() => { setDirection(i > current ? 1 : -1); setCurrent(i); }}
                  className="h-2 rounded-full transition-all duration-300"
                  style={{
                    width: i === current ? '1.5rem' : '0.5rem',
                    background: i === current ? 'var(--skin-primary)' : 'var(--skin-border)',
                  }}
                  aria-label={`Guru ${i + 1}`}
                />
              ))}
            </div>
            <span className="text-xs font-medium" style={{ color: 'var(--skin-text-muted)' }}>
              {current + 1} / {featured.length}
            </span>
          </div>
        </div>

        {/* CTA link */}
        <div className="text-center mt-8">
          <Link
            href="/guru"
            className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold rounded-xl border-2 transition-all hover:shadow-lg"
            style={{ borderColor: 'var(--skin-primary)', color: 'var(--skin-primary)' }}
          >
            Lihat Semua Guru & Staff
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
