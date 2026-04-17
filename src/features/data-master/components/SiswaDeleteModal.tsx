'use client'

import { Button, Modal } from '@/components/ui'
import shared from '@/styles/page.module.css'

type SiswaDeleteModalProps = {
  target: { id: string; nama: string } | null
  onClose: () => void
  onConfirm: () => void
}

export function SiswaDeleteModal({ target, onClose, onConfirm }: SiswaDeleteModalProps) {
  return (
    <Modal isOpen={!!target} onClose={onClose} title="Konfirmasi Hapus">
      <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-6)' }}>
        Hapus siswa <strong style={{ color: 'var(--text-primary)' }}>{target?.nama}</strong>? Semua tagihan terkait juga akan terhapus.
      </p>
      <div className={shared.modalFooter}>
        <Button variant="secondary" onClick={onClose}>Batal</Button>
        <Button variant="danger" onClick={onConfirm}>Ya, Hapus</Button>
      </div>
    </Modal>
  )
}
