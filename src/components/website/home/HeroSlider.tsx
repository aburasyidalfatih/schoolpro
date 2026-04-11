'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
interface Slide {
  id: number;
  image: string;
  title: string;
  subtitle: string;
  cta?: string | null;
  ctaLink?: string | null;
}

export default function HeroSlider({ slides = [] }: { slides: Slide[] }) {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);

  if (slides.length === 0) return null;

  const next = useCallback(() => {
    setDirection(1);
    setCurrent((prev) => (prev + 1) % slides.length);
  }, []);

  const prev = useCallback(() => {
    setDirection(-1);
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  }, []);

  useEffect(() => {
    const timer = setInterval(next, 6000);
    return () => clearInterval(timer);
  }, [next]);

  const variants = {
    enter: (d: number) => ({ x: d > 0 ? '100%' : '-100%', opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d > 0 ? '-100%' : '100%', opacity: 0 }),
  };

  return (
    <section className="relative h-[60vh] sm:h-[70vh] lg:h-[85vh] overflow-hidden" id="hero-slider" aria-label="Slider Utama">
      <AnimatePresence custom={direction} mode="popLayout">
        <motion.div
          key={current}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.7, ease: [0.45, 0, 0.15, 1] }}
          className="absolute inset-0"
        >
          {/* Ken Burns Effect — Slow zoom pan on background */}
          <motion.div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${slides[current].image})` }}
            initial={{ scale: 1 }}
            animate={{ scale: 1.08 }}
            transition={{ duration: 8, ease: 'linear' }}
          />
          <div className="hero-gradient-overlay absolute inset-0" />
        </motion.div>
      </AnimatePresence>

      {/* Content */}
      <div className="relative z-10 h-full flex items-end pb-12 sm:pb-20 lg:pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="max-w-3xl"
            >
              {/* Slide counter badge */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm text-white/70 text-[10px] sm:text-xs font-medium mb-3 sm:mb-4 border border-white/10"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                {current + 1} / {slides.length}
              </motion.div>

              <h2 className="text-2xl sm:text-4xl lg:text-6xl font-bold text-white leading-tight mb-3 sm:mb-4 drop-shadow-lg"
                style={{ fontFamily: 'var(--font-heading)' }}>
                {slides[current].title}
              </h2>
              <p className="text-sm sm:text-lg lg:text-xl text-white/80 mb-6 sm:mb-8 max-w-2xl leading-relaxed line-clamp-3 sm:line-clamp-none">
                {slides[current].subtitle}
              </p>
              {slides[current].cta && (
                <a
                  href={slides[current].ctaLink || '#'}
                  className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl text-sm sm:text-base font-bold text-white shadow-2xl hover:shadow-3xl hover:scale-105 transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white w-full sm:w-auto"
                  style={{ background: 'linear-gradient(135deg, var(--skin-primary), var(--skin-primary-light))' }}
                >
                  {slides[current].cta}
                  <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
                </a>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation Arrows - Hidden on mobile, dots are primary */}
      <button
        onClick={prev}
        className="hidden sm:flex absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-xl bg-white/10 backdrop-blur hover:bg-white/25 items-center justify-center text-white transition-all focus-visible:outline-2 focus-visible:outline-white"
        aria-label="Slide sebelumnya"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>
      <button
        onClick={next}
        className="hidden sm:flex absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-xl bg-white/10 backdrop-blur hover:bg-white/25 items-center justify-center text-white transition-all focus-visible:outline-2 focus-visible:outline-white"
        aria-label="Slide berikutnya"
      >
        <ChevronRight className="h-6 w-6" />
      </button>

      {/* Progress Bar + Dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-3">
        <div className="flex gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => { setDirection(i > current ? 1 : -1); setCurrent(i); }}
              className="relative h-2 rounded-full transition-all duration-300 overflow-hidden"
              style={{ width: i === current ? '2rem' : '0.5rem', background: i === current ? 'transparent' : 'rgba(255,255,255,0.4)' }}
              aria-label={`Slide ${i + 1}`}
              aria-current={i === current ? 'true' : undefined}
            >
              {i === current && (
                <>
                  <div className="absolute inset-0 bg-white/30 rounded-full" />
                  <motion.div
                    className="absolute inset-y-0 left-0 bg-white rounded-full"
                    initial={{ width: '0%' }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 6, ease: 'linear' }}
                    key={`progress-${current}`}
                  />
                </>
              )}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
