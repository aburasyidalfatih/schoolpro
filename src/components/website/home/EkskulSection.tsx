'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Users, Clock, CheckCircle, XCircle } from 'lucide-react';
import SectionTitle from '@/components/website/shared/SectionTitle';
interface EkskulItem {
  id: number;
  slug: string;
  name: string;
  category: string;
  day: string;
  memberCount: number;
  maxMembers: number;
  registrationOpen: boolean;
  image?: string | null;
}

export default function EkskulSection({ ekskul = [] }: { ekskul: EkskulItem[] }) {
  const topEkskul = ekskul.slice(0, 6);

  if (topEkskul.length === 0) return null;

  return (
    <section
      className="py-16 lg:py-24 px-4 sm:px-6 lg:px-8"
      style={{ background: 'var(--skin-section-alt)' }}
    >
      <div className="max-w-7xl mx-auto">
        <SectionTitle
          title="Kegiatan Ekstrakurikuler"
          subtitle="Beragam kegiatan pengembangan diri untuk menyalurkan bakat dan minat santriwati"
        />

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {topEkskul.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
            >
              <Link href={`/ekskul/${item.slug}`} className="block group h-full">
                <div className="h-full bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all overflow-hidden border"
                  style={{ borderColor: 'var(--skin-border)' }}>
                  <div className="relative h-40 overflow-hidden">
                    <Image
                      src={item.image || ''}
                      alt={item.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute top-3 right-3">
                      {item.registrationOpen ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-green-500 text-white shadow-lg">
                          <CheckCircle className="h-3 w-3" /> Buka
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-red-500 text-white shadow-lg">
                          <XCircle className="h-3 w-3" /> Penuh
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-5">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full"
                      style={{ background: 'var(--skin-surface)', color: 'var(--skin-primary)' }}>
                      {item.category}
                    </span>
                    <h3 className="text-base font-bold mt-2 mb-2 group-hover:underline decoration-2 underline-offset-4"
                      style={{ color: 'var(--skin-text-heading)' }}>
                      {item.name}
                    </h3>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs" style={{ color: 'var(--skin-text-muted)' }}>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {item.day}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" /> {item.memberCount}/{item.maxMembers}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link
            href="/ekskul"
            className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold rounded-xl border-2 transition-all hover:shadow-lg"
            style={{ borderColor: 'var(--skin-primary)', color: 'var(--skin-primary)' }}
          >
            Lihat Semua Ekskul
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
