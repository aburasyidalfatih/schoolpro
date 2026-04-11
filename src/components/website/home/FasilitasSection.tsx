'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Eye } from 'lucide-react';
import SectionTitle from '@/components/website/shared/SectionTitle';
interface FasilitasItem {
  id: number;
  slug: string;
  name: string;
  category: string;
  capacity?: string | null;
  image?: string | null;
}

export default function FasilitasSection({ fasilitas = [] }: { fasilitas: FasilitasItem[] }) {
  const topFasilitas = fasilitas.slice(0, 4);

  if (topFasilitas.length === 0) return null;

  return (
    <section className="py-16 lg:py-24 px-4 sm:px-6 lg:px-8" style={{ background: 'var(--skin-surface)' }}>
      <div className="max-w-7xl mx-auto">
        <SectionTitle
          title="Fasilitas Unggulan"
          subtitle="Sarana dan prasarana modern untuk menunjang proses belajar mengajar"
        />

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {topFasilitas.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <Link href={`/fasilitas/${item.slug}`} className="block group">
                <div className="relative h-64 sm:h-72 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all">
                  <Image
                    src={item.image || ''}
                    alt={item.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
                        <Eye className="h-6 w-6 text-white" />
                      </div>
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full text-white/90 bg-white/20 backdrop-blur">
                      {item.category}
                    </span>
                    <h3 className="text-lg font-bold text-white mt-2">{item.name}</h3>
                    {item.capacity && (
                      <p className="text-xs text-white/70 mt-0.5">Kapasitas: {item.capacity}</p>
                    )}
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link
            href="/fasilitas"
            className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold rounded-xl border-2 transition-all hover:shadow-lg"
            style={{ borderColor: 'var(--skin-primary)', color: 'var(--skin-primary)' }}
          >
            Lihat Semua Fasilitas
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
