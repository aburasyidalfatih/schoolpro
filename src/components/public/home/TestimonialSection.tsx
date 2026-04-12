'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Quote, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import SectionTitle from '@/components/public/shared/SectionTitle';

const testimonials = [
  {
    id: 1,
    name: 'Ibu Hj. Ratna Dewi',
    role: 'Wali Santriwati Kelas XI',
    text: 'Alhamdulillah, putri saya berkembang pesat sejak masuk pesantren ini. Hafalan Al-Quran bertambah, akhlak semakin baik, dan prestasinya meningkat. Lingkungan yang Islami sangat mendukung.',
    rating: 5,
    avatar: 'RD',
  },
  {
    id: 2,
    name: 'Bapak Dr. Irfan Hakim',
    role: 'Wali Santriwati Kelas XII',
    text: 'Fasilitas pesantren sangat memadai. Program tahfidz dan akademik berjalan seimbang. Anak saya berhasil meraih juara olimpiade sekaligus menyelesaikan 15 juz hafalan.',
    rating: 5,
    avatar: 'IH',
  },
  {
    id: 3,
    name: 'Anisa Putri R.',
    role: 'Alumni Angkatan 37',
    text: 'Pesantren ini mengajarkan saya bukan hanya ilmu, tapi juga karakter. Berkat bekal dari pesantren, saya diterima di PTN favorit dan siap menghadapi dunia modern tanpa meninggalkan nilai-nilai Islam.',
    rating: 5,
    avatar: 'AP',
  },
  {
    id: 4,
    name: 'Ibu Siti Nurjanah',
    role: 'Wali Santriwati Kelas X',
    text: 'Awalnya khawatir melepas anak jauh dari rumah, tapi melihat perkembangannya di pesantren ini, saya sangat bersyukur. Para ustadzah sangat perhatian dan profesional.',
    rating: 5,
    avatar: 'SN',
  },
  {
    id: 5,
    name: 'Bapak H. Ahmad Fauzi',
    role: 'Wali Santriwati Kelas IX',
    text: 'Keputusan terbaik yang pernah kami buat adalah mendaftarkan anak ke pesantren ini. Bukan hanya akademik yang bagus, tapi pembinaan akhlak dan kemandirian juga sangat luar biasa.',
    rating: 5,
    avatar: 'AF',
  },
  {
    id: 6,
    name: 'Hafshah Azzahra',
    role: 'Alumni Angkatan 36',
    text: 'Saya sangat berterima kasih kepada para ustadzah yang selalu membimbing dan mendukung kami. Pengalaman di pesantren ini membentuk fondasi yang kuat untuk masa depan saya.',
    rating: 5,
    avatar: 'HA',
  },
];

export default function TestimonialSection() {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);

  const next = useCallback(() => {
    setDirection(1);
    setCurrent((prev) => (prev + 1) % testimonials.length);
  }, []);

  const prev = useCallback(() => {
    setDirection(-1);
    setCurrent((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  }, []);

  // Auto-slide
  useEffect(() => {
    const timer = setInterval(next, 4500);
    return () => clearInterval(timer);
  }, [next]);

  const item = testimonials[current];

  const variants = {
    enter: (d: number) => ({ x: d > 0 ? 200 : -200, opacity: 0, scale: 0.95 }),
    center: { x: 0, opacity: 1, scale: 1 },
    exit: (d: number) => ({ x: d > 0 ? -200 : 200, opacity: 0, scale: 0.95 }),
  };

  return (
    <section
      className="py-16 lg:py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden"
      style={{ background: 'var(--skin-section-alt)' }}
    >
      {/* Background ornamental pattern */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      }} />

      <div className="max-w-7xl mx-auto relative">
        <SectionTitle
          title="Apa Kata Mereka"
          subtitle="Testimoni dari wali murid dan alumni tentang pengalaman di Pesantren Putri Syech Ahmad Khatib"
        />

        {/* Slider */}
        <div className="max-w-3xl mx-auto relative">
          {/* Nav arrows — outside the card */}
          <button
            onClick={prev}
            className="hidden sm:flex absolute -left-4 lg:-left-16 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-xl border-2 items-center justify-center transition-all hover:shadow-md focus-visible:outline-2 backdrop-blur-md"
            style={{ borderColor: 'var(--skin-primary)', color: 'var(--skin-primary)', background: 'var(--skin-card-bg)' }}
            aria-label="Testimoni sebelumnya"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={next}
            className="hidden sm:flex absolute -right-4 lg:-right-16 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-xl items-center justify-center text-white transition-all hover:shadow-md focus-visible:outline-2"
            style={{ background: 'linear-gradient(135deg, var(--skin-primary), var(--skin-primary-light))' }}
            aria-label="Testimoni berikutnya"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          {/* Card slider */}
          <div className="overflow-hidden rounded-2xl">
            <AnimatePresence custom={direction} mode="wait">
              <motion.div
                key={item.id}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                className="rounded-2xl shadow-lg p-8 sm:p-10 border relative overflow-hidden backdrop-blur-md"
                style={{ borderColor: 'var(--skin-border)', background: 'var(--skin-card-bg)' }}
              >
                {/* Large quote decoration */}
                <div className="absolute -top-3 -left-2 text-[120px] font-serif leading-none opacity-[0.06] pointer-events-none"
                  style={{ color: 'var(--skin-primary)', fontFamily: 'Georgia, serif' }}>
                  &ldquo;
                </div>

                {/* Content */}
                <div className="relative">
                  {/* Quote icon */}
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-white mb-5 shadow-lg"
                    style={{ background: 'linear-gradient(135deg, var(--skin-primary), var(--skin-primary-light))' }}
                  >
                    <Quote className="h-6 w-6" />
                  </div>

                  {/* Stars */}
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: item.rating }).map((_, j) => (
                      <Star key={j} className="h-4 w-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>

                  {/* Testimonial text */}
                  <p className="text-base sm:text-lg leading-relaxed mb-6 italic" style={{ color: 'var(--skin-text-body)' }}>
                    &ldquo;{item.text}&rdquo;
                  </p>

                  {/* Separator */}
                  <div className="h-px mb-5" style={{ background: 'var(--skin-border)' }} />

                  {/* Author */}
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold text-white"
                      style={{ background: 'linear-gradient(135deg, var(--skin-primary), var(--skin-primary-light))' }}>
                      {item.avatar}
                    </div>
                    <div>
                      <p className="font-bold" style={{ color: 'var(--skin-text-heading)' }}>{item.name}</p>
                      <p className="text-xs font-medium" style={{ color: 'var(--skin-text-muted)' }}>{item.role}</p>
                    </div>
                  </div>
                </div>

                {/* Decorative corner */}
                <div
                  className="absolute -bottom-10 -right-10 w-32 h-32 rounded-full opacity-5"
                  style={{ background: 'var(--skin-primary)' }}
                />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Dots */}
          <div className="flex justify-center gap-1.5 mt-6">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => { setDirection(i > current ? 1 : -1); setCurrent(i); }}
                className="h-2 rounded-full transition-all duration-300"
                style={{
                  width: i === current ? '1.5rem' : '0.5rem',
                  background: i === current ? 'var(--skin-primary)' : 'var(--skin-border)',
                }}
                aria-label={`Testimoni ${i + 1}`}
                aria-current={i === current ? 'true' : undefined}
              />
            ))}
          </div>

          <div className="flex items-center justify-center gap-3 mt-4 sm:hidden">
            <button
              onClick={prev}
              className="w-10 h-10 rounded-xl border-2 flex items-center justify-center transition-all focus-visible:outline-2 backdrop-blur-md"
              style={{ borderColor: 'var(--skin-primary)', color: 'var(--skin-primary)', background: 'var(--skin-card-bg)' }}
              aria-label="Testimoni sebelumnya"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <span className="text-xs font-medium" style={{ color: 'var(--skin-text-muted)' }}>
              {current + 1} / {testimonials.length}
            </span>
            <button
              onClick={next}
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white transition-all focus-visible:outline-2"
              style={{ background: 'linear-gradient(135deg, var(--skin-primary), var(--skin-primary-light))' }}
              aria-label="Testimoni berikutnya"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
