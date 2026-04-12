'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Users, GraduationCap, Trophy, Dumbbell, TrendingUp, BookOpen } from 'lucide-react';

interface StatsCounterProps {
  stats: {
    students: number;
    teachers: number;
    achievements: number;
    extracurriculars: number;
  };
  akreditasi: string;
}

function Counter({ value, suffix }: { value: number; suffix: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const duration = 2000;
    const step = value / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [isInView, value]);

  return (
    <span ref={ref} className="tabular-nums">
      {count.toLocaleString('id-ID')}{suffix}
    </span>
  );
}

export default function StatsCounter({ stats, akreditasi }: StatsCounterProps) {
  const statsList = [
    { icon: <Users className="h-7 w-7" />, value: stats.students, label: 'Santriwati Aktif', suffix: '+', highlight: true },
    { icon: <GraduationCap className="h-7 w-7" />, value: stats.teachers, label: 'Tenaga Pendidik', suffix: '' },
    { icon: <Trophy className="h-7 w-7" />, value: stats.achievements, label: 'Prestasi', suffix: '+' },
    { icon: <Dumbbell className="h-7 w-7" />, value: stats.extracurriculars, label: 'Ekstrakurikuler', suffix: '' },
  ];

  return (
    <section className="relative z-20 px-4 sm:px-6 lg:px-8 flow-root" style={{ background: 'var(--skin-surface)' }}>
      <div className="max-w-6xl mx-auto relative -mt-8 sm:-mt-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="glass-card rounded-2xl shadow-2xl p-5 sm:p-8"
        >
          {/* Bento Grid Layout - 1 col on XS, 2 col on SM, 4 col on LG */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {statsList.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className={`relative text-center p-4 sm:p-6 rounded-2xl overflow-hidden group transition-all hover:shadow-lg ${
                  i === 0 ? 'lg:row-span-1' : ''
                }`}
                style={{ background: 'var(--skin-surface)' }}
              >
                {/* Background pattern */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{
                    background: `radial-gradient(circle at 50% 0%, var(--skin-primary-light) 0%, transparent 70%)`,
                    opacity: 0.05,
                  }}
                />
                <div
                  className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-xl mx-auto mb-3 flex items-center justify-center text-white shadow-lg transition-transform group-hover:scale-110"
                  style={{ background: 'linear-gradient(135deg, var(--skin-primary), var(--skin-primary-light))' }}
                >
                  <div className="scale-75 sm:scale-100">
                    {stat.icon}
                  </div>
                </div>
                <p className="text-xl sm:text-3xl lg:text-4xl font-bold mb-1" style={{ color: 'var(--skin-text-heading)' }}>
                  <Counter value={stat.value} suffix={stat.suffix} />
                </p>
                <p className="text-[10px] sm:text-xs lg:text-sm font-medium uppercase tracking-wider lg:normal-case" style={{ color: 'var(--skin-text-muted)' }}>
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Tagline bar */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6 }}
            className="mt-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[10px] sm:text-[11px] lg:text-sm font-medium"
            style={{ color: 'var(--skin-text-muted)' }}
          >
            <div className="flex items-center gap-1.5">
              <TrendingUp className="h-3.5 w-3.5" style={{ color: 'var(--skin-secondary)' }} />
              <span>Terus bertumbuh sejak 1985</span>
            </div>
            <span className="hidden sm:inline mx-2 opacity-30">•</span>
            <div className="flex items-center gap-1.5">
              <BookOpen className="h-3.5 w-3.5" style={{ color: 'var(--skin-accent)' }} />
              <span>Akreditasi {akreditasi}</span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
