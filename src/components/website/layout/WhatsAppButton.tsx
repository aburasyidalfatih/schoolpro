'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface WhatsAppSchoolInfo {
  phone?: string;
  name?: string;
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  );
}

export default function WhatsAppButton({ schoolInfo }: { schoolInfo: WhatsAppSchoolInfo }) {
  const [isOpen, setIsOpen] = useState(false);
  const rawPhone = schoolInfo?.phone || '6281234567890';
  const phone = rawPhone.replace(/\D/g, ''); // Extract only digits
  const defaultMessage = encodeURIComponent('Assalamu\'alaikum, saya ingin bertanya tentang PPDB di ' + (schoolInfo?.name || 'Pesantren Putri Syech Ahmad Khatib') + '.');
  const panelWidth = 'min(300px, calc(100vw - 2rem))';

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="absolute bottom-16 right-0 rounded-2xl shadow-2xl overflow-hidden"
            style={{ background: 'var(--skin-card-bg, white)', width: panelWidth, maxWidth: panelWidth }}
          >
            {/* Header */}
            <div className="p-4 text-white relative overflow-hidden" style={{ background: '#25D366' }}>
              <div className="absolute -top-4 -right-4 w-24 h-24 rounded-full bg-white/10" />
              <button onClick={() => setIsOpen(false)} className="absolute top-3 right-3 w-6 h-6 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors">
                <X className="h-3.5 w-3.5" />
              </button>
              <div className="flex items-center gap-3 relative z-10">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <WhatsAppIcon className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-bold text-sm">Admin Pesantren</p>
                  <p className="text-xs text-white/80">Biasanya merespons dalam 1 jam</p>
                </div>
              </div>
            </div>

            {/* Chat Bubble */}
            <div className="p-4" style={{ background: 'var(--skin-surface, #f0f2f5)' }}>
              <div className="bg-white rounded-xl rounded-tl-none p-3 shadow-sm text-sm leading-relaxed" style={{ color: 'var(--skin-text-body)' }}>
                Assalamu&apos;alaikum!
                <br />
                Ada yang bisa kami bantu? Silakan tanyakan seputar PPDB, program, atau informasi lainnya.
              </div>
            </div>

            {/* CTA */}
            <div className="p-4">
              <a
                href={`https://wa.me/${phone}?text=${defaultMessage}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-white font-bold text-sm shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all"
                style={{ background: '#25D366' }}
              >
                <WhatsAppIcon className="h-5 w-5" />
                Mulai Chat
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl text-white shadow-2xl flex items-center justify-center relative"
        style={{ background: '#25D366' }}
        aria-label="Chat WhatsApp"
      >
        {isOpen ? (
          <X className="h-5 w-5 sm:h-6 sm:w-6" />
        ) : (
          <>
            <WhatsAppIcon className="h-6 w-6 sm:h-7 sm:w-7" />
            {/* Ping indicator */}
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-red-500 border-2 border-white flex items-center justify-center">
              <span className="text-[7px] sm:text-[8px] font-bold text-white">1</span>
            </span>
          </>
        )}
      </motion.button>
    </div>
  );
}
