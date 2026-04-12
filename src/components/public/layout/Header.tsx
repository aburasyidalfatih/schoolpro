'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ChevronDown, GraduationCap } from 'lucide-react';

interface SchoolInfoProps {
  shortName: string;
  name: string;
}

const navItems = [
  { label: 'Beranda', href: '/' },
  {
    label: 'Informasi',
    children: [
      { label: 'Agenda', href: '/agenda' },
      { label: 'Pengumuman', href: '/pengumuman' },
    ],
  },
  {
    label: 'Akademik',
    children: [
      { label: 'Editorial Kepala Pesantren', href: '/editorial' },
      { label: 'Blog Guru', href: '/blog' },
      { label: 'Guru & Staff', href: '/guru' },
    ],
  },
  { label: 'Prestasi', href: '/prestasi' },
  { label: 'Fasilitas', href: '/fasilitas' },
  { label: 'Ekskul', href: '/ekskul' },
  { label: 'Profil', href: '/profil' },
  { label: 'Kontak', href: '/kontak' },
];

export default function Header({ schoolInfo }: { schoolInfo: SchoolInfoProps }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  // Auto-close mobile menu on route change
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setMobileOpen(false);
      setOpenDropdown(null);
    }, 0);

    return () => window.clearTimeout(timer);
  }, [pathname]);

  // Detect scroll for shadow enhancement
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Check if dropdown parent is active
  const isParentActive = (children: { href: string }[]) => {
    return children.some(child => pathname.startsWith(child.href));
  };

  return (
    <header className={`sticky top-0 z-50 glass transition-shadow duration-300 ${scrolled ? 'shadow-lg' : 'shadow-sm'}`}>
      {/* Skip Navigation Link for Accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[60] focus:px-4 focus:py-2 focus:rounded-lg focus:text-white focus:font-semibold focus:text-sm"
        style={{ background: 'var(--skin-primary)' }}
      >
        Langsung ke konten utama
      </a>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 flex-shrink-0 group">
            <div
              className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-105"
              style={{ background: 'linear-gradient(135deg, var(--skin-primary), var(--skin-primary-light))' }}
            >
              <GraduationCap className="h-6 w-6 lg:h-7 lg:w-7 text-white" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-xs sm:text-sm lg:text-base font-bold leading-tight line-clamp-1 sm:line-clamp-none max-w-[150px] sm:max-w-none" 
                style={{ color: 'var(--skin-text-heading)' }}>
                {schoolInfo.shortName}
              </h1>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1" role="navigation" aria-label="Navigasi utama">
            {navItems.map((item) =>
              item.children ? (
                <div
                  key={item.label}
                  className="relative"
                  onMouseEnter={() => setOpenDropdown(item.label)}
                  onMouseLeave={() => setOpenDropdown(null)}
                >
                  <button
                    className="flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 hover:bg-black/5 focus-visible:outline-2 focus-visible:outline-offset-2"
                    style={{
                      color: isParentActive(item.children) ? 'var(--skin-primary)' : 'var(--skin-text-body)',
                      fontWeight: isParentActive(item.children) ? '700' : '500',
                      outlineColor: 'var(--skin-primary)',
                    }}
                    aria-expanded={openDropdown === item.label}
                    aria-haspopup="true"
                  >
                    {item.label}
                    <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${openDropdown === item.label ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {openDropdown === item.label && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-full left-0 mt-1 w-56 glass-card rounded-xl shadow-xl py-2 overflow-hidden"
                        role="menu"
                      >
                        {item.children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            className="block px-4 py-2.5 text-sm transition-all hover:bg-black/5 hover:pl-5 focus-visible:outline-2 focus-visible:outline-offset-2"
                            style={{
                              color: pathname === child.href ? 'var(--skin-primary)' : 'var(--skin-text-body)',
                              fontWeight: pathname === child.href ? '600' : '400',
                              outlineColor: 'var(--skin-primary)',
                            }}
                            role="menuitem"
                          >
                            {child.label}
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link
                  key={item.href}
                  href={item.href!}
                  className="relative px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 hover:bg-black/5 focus-visible:outline-2 focus-visible:outline-offset-2"
                  style={{
                    color: pathname === item.href ? 'var(--skin-primary)' : 'var(--skin-text-body)',
                    fontWeight: pathname === item.href ? '700' : '500',
                    outlineColor: 'var(--skin-primary)',
                  }}
                >
                  {item.label}
                  {pathname === item.href && (
                    <motion.div
                      layoutId="activeNav"
                      className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full"
                      style={{ background: 'var(--skin-primary)' }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  )}
                </Link>
              )
            )}
          </nav>

          {/* CTA + Mobile Toggle */}
          <div className="flex items-center gap-3">
            <Link
              href="/app/login"
              className="hidden sm:inline-flex items-center px-5 py-2.5 rounded-xl text-sm font-bold text-white shadow-lg transition-all hover:shadow-xl hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2"
              style={{ background: 'linear-gradient(135deg, var(--skin-primary), var(--skin-primary-light))' }}
            >
              Masuk
            </Link>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-black/5 focus-visible:outline-2 focus-visible:outline-offset-2"
              aria-label={mobileOpen ? 'Tutup menu' : 'Buka menu'}
              aria-expanded={mobileOpen}
              style={{ outlineColor: 'var(--skin-primary)' }}
            >
              {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden overflow-hidden border-t"
            style={{ borderColor: 'var(--skin-border)' }}
          >
            <nav className="px-4 py-4 space-y-1" style={{ background: 'var(--skin-surface)' }} role="navigation" aria-label="Navigasi mobile">
              {navItems.map((item) =>
                item.children ? (
                  <div key={item.label}>
                    <button
                      onClick={() =>
                        setOpenDropdown(openDropdown === item.label ? null : item.label)
                      }
                      className="flex items-center justify-between w-full px-3 py-2.5 text-sm font-medium rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2"
                      style={{
                        color: isParentActive(item.children) ? 'var(--skin-primary)' : 'var(--skin-text-body)',
                        fontWeight: isParentActive(item.children) ? '700' : '500',
                        outlineColor: 'var(--skin-primary)',
                      }}
                      aria-expanded={openDropdown === item.label}
                    >
                      {item.label}
                      <ChevronDown
                        className={`h-4 w-4 transition-transform ${
                          openDropdown === item.label ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                    <AnimatePresence>
                      {openDropdown === item.label && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="pl-4 overflow-hidden"
                        >
                          {item.children.map((child) => (
                            <Link
                              key={child.href}
                              href={child.href}
                              className="block px-3 py-2 text-sm rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2"
                              style={{
                                color: pathname === child.href ? 'var(--skin-primary)' : 'var(--skin-text-muted)',
                                fontWeight: pathname === child.href ? '600' : '400',
                                outlineColor: 'var(--skin-primary)',
                              }}
                            >
                              {child.label}
                            </Link>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <Link
                    key={item.href}
                    href={item.href!}
                    className="block px-3 py-2.5 text-sm font-medium rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2"
                    style={{
                      color: pathname === item.href ? 'var(--skin-primary)' : 'var(--skin-text-body)',
                      fontWeight: pathname === item.href ? '700' : '500',
                      outlineColor: 'var(--skin-primary)',
                    }}
                  >
                    {item.label}
                  </Link>
                )
              )}
              <Link
                href="/app/login"
                className="block text-center mt-3 px-5 py-3 rounded-xl text-sm font-bold text-white shadow-lg"
                style={{ background: 'linear-gradient(135deg, var(--skin-primary), var(--skin-primary-light))' }}
              >
                Masuk
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
