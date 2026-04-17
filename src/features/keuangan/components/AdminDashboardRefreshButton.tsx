'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { CalendarDays, Loader2 } from 'lucide-react'

export function AdminDashboardRefreshButton() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  return (
    <button
      className="btn btn-secondary btn-sm"
      onClick={() => {
        startTransition(() => {
          router.refresh()
        })
      }}
      disabled={isPending}
    >
      {isPending ? <Loader2 size={16} className="animate-spin" /> : <CalendarDays size={16} />}
      Refresh
    </button>
  )
}
