'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import SectionTitle from '@/components/website/shared/SectionTitle';
import { Badge } from '@/components/website/shared/Badge';
interface BlogItem {
  id: number;
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  author: string;
  authorPhoto: string;
  category: string;
  image?: string | null;
}

export default function BlogSection({ blogs = [] }: { blogs: BlogItem[] }) {
  const latestBlogs = blogs.slice(0, 3);

  if (latestBlogs.length === 0) return null;

  return (
    <section className="py-16 lg:py-24 px-4 sm:px-6 lg:px-8" style={{ background: 'var(--skin-surface)' }}>
      <div className="max-w-7xl mx-auto">
        <SectionTitle
          title="Blog Guru"
          subtitle="Tulisan, modul, dan refleksi dari tenaga pendidik kami"
        />

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {latestBlogs.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <Link href={`/blog/${item.slug}`} className="block group h-full">
                <div className="h-full bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all overflow-hidden border"
                  style={{ borderColor: 'var(--skin-border)' }}>
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={item.image || ''}
                      alt={item.title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3">
                      <Badge className="text-[10px] text-white shadow-lg"
                        style={{ background: 'var(--skin-primary)' }}>
                        {item.category}
                      </Badge>
                    </div>
                  </div>

                  <div className="p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="relative w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                        <Image src={item.authorPhoto} alt={item.author} fill className="object-cover" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold" style={{ color: 'var(--skin-text-heading)' }}>
                          {item.author.split(',')[0]}
                        </p>
                        <p className="text-[10px]" style={{ color: 'var(--skin-text-muted)' }}>
                          {new Date(item.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                      </div>
                    </div>
                    <h3 className="text-base font-bold mb-2 line-clamp-2 group-hover:underline decoration-2 underline-offset-4"
                      style={{ color: 'var(--skin-text-heading)' }}>
                      {item.title}
                    </h3>
                    <p className="text-sm leading-relaxed line-clamp-2" style={{ color: 'var(--skin-text-muted)' }}>
                      {item.excerpt}
                    </p>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold rounded-xl border-2 transition-all hover:shadow-lg"
            style={{ borderColor: 'var(--skin-primary)', color: 'var(--skin-primary)' }}
          >
            Baca Semua Artikel
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
