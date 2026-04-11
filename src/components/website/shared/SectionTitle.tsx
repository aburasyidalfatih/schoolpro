'use client';

import { motion } from 'framer-motion';

interface SectionTitleProps {
  title: string;
  subtitle?: string;
  center?: boolean;
  light?: boolean;
}

export default function SectionTitle({ title, subtitle, center = true, light = false }: SectionTitleProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5 }}
      className={`mb-10 lg:mb-14 ${center ? 'text-center' : ''}`}
    >
      {/* Ornamental top element */}
      <div className={`flex items-center gap-3 mb-4 ${center ? 'justify-center' : ''}`}>
        <div className="h-px w-8 opacity-30" style={{ background: light ? '#fff' : 'var(--skin-primary)' }} />
        <div className="w-2 h-2 rounded-full" style={{ background: light ? 'rgba(255,255,255,0.5)' : 'var(--skin-accent)' }} />
        <div className="h-px w-8 opacity-30" style={{ background: light ? '#fff' : 'var(--skin-primary)' }} />
      </div>

      <h2
        className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3"
        style={{ color: light ? '#fff' : 'var(--skin-text-heading)', fontFamily: 'var(--font-heading)' }}
      >
        {title}
      </h2>
      <div className={`section-divider ${center ? 'mx-auto' : ''} mb-4`} />
      {subtitle && (
        <p
          className="text-sm sm:text-base max-w-2xl leading-relaxed"
          style={{
            color: light ? 'rgba(255,255,255,0.75)' : 'var(--skin-text-muted)',
            ...(center ? { marginInline: 'auto' } : {}),
          }}
        >
          {subtitle}
        </p>
      )}
    </motion.div>
  );
}
