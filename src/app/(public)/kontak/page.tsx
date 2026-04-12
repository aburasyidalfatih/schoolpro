import PageHeader from '@/components/public/shared/PageHeader'
import KontakContent from './KontakContent'
import { getWebsiteTenant } from '@/lib/tenant'

function getObjectRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : {}
}

function getStringValue(record: Record<string, unknown>, key: string): string {
  const value = record[key]
  return typeof value === 'string' ? value : ''
}

export default async function KontakPage() {
  const tenant = await getWebsiteTenant()
  if (!tenant) return null

  const pengaturan = getObjectRecord(tenant.pengaturan)

  const schoolInfo = {
    address: tenant.alamat || '',
    phone: tenant.telepon || '',
    email: tenant.email || '',
    mapEmbed: getStringValue(pengaturan, 'mapEmbed'),
  }

  return (
    <>
      <PageHeader title="Hubungi Kami" description="Jangan ragu untuk menghubungi kami"
        breadcrumbs={[{ label: 'Kontak' }]} />
      <div className="py-12 lg:py-20 px-4 sm:px-6 lg:px-8">
        <KontakContent schoolInfo={schoolInfo} />
      </div>
    </>
  )
}
