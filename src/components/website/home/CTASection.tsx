'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, GraduationCap, Users, Award } from 'lucide-react';

export default function CTASection() {
  return (
    <section className="relative py-20 lg:py-28 overflow-hidden" id="ppdb">
      <div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(135deg, var(--skin-primary-dark), var(--skin-primary), var(--skin-accent))' }}
      />

      {/* Animated decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-white/5"
        />
        <motion.div
          animate={{ x: [0, -20, 0], y: [0, 30, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-white/5"
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-white/[0.02]" />

        {/* Floating icons */}
        <motion.div
          animate={{ y: [0, -15, 0], rotate: [0, 10, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-16 left-[15%] opacity-10"
        >
          <GraduationCap className="h-12 w-12 text-white" />
        </motion.div>
        <motion.div
          animate={{ y: [0, 15, 0], rotate: [0, -10, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          className="absolute bottom-20 right-[20%] opacity-10"
        >
          <Award className="h-10 w-10 text-white" />
        </motion.div>
        <motion.div
          animate={{ y: [0, -10, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          className="absolute top-1/3 right-[10%] opacity-10"
        >
          <Users className="h-8 w-8 text-white" />
        </motion.div>
      </div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            initial={{ scale: 0.9 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur text-white text-sm font-medium mb-6 border border-white/20"
          >
            <Sparkles className="h-4 w-4 text-amber-300" />
            Portal Akses Sekolah
          </motion.div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight"
            style={{ fontFamily: 'var(--font-heading)' }}>
            Bergabunglah dengan
            <br />
            <span className="bg-gradient-to-r from-white via-white/90 to-white/70 bg-clip-text text-transparent">
              Keluarga Besar Pesantren
            </span>
          </h2>

          <p className="text-base sm:text-lg text-white/75 mb-10 max-w-2xl mx-auto leading-relaxed">
            Masuk ke portal SchoolPro untuk mengakses dashboard sekolah atau membuat akun baru
            dengan tampilan yang konsisten dengan tema aktif.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex"
            >
              <Link
                href="/app/login"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-base font-bold text-white shadow-2xl transition-all bg-white/20 backdrop-blur border border-white/30 hover:bg-white/30 focus-visible:outline-2 focus-visible:outline-white"
              >
                Login
                <ArrowRight className="h-5 w-5" />
              </Link>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex"
            >
              <Link
                href="/app/register"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-base font-bold shadow-xl transition-all bg-white hover:bg-white/95 focus-visible:outline-2 focus-visible:outline-white"
                style={{ color: 'var(--skin-primary)' }}
              >
                Register
                <ArrowRight className="h-5 w-5" />
              </Link>
            </motion.div>
          </div>

          {/* Trust indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-white/50 text-xs"
          >
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-400" />
              Pendaftaran Online 24/7
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              Beasiswa Tersedia
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-400" />
              Akreditasi A (Unggul)
            </span>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
