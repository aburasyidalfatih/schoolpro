import PageHeader from '@/components/website/shared/PageHeader'
import KontakContent from './KontakContent'
import { getWebsiteTenant } from '@/lib/tenant'

export default async function KontakPage() {
  const tenant = await getWebsiteTenant()
  if (!tenant) return null

  const pengaturan = (tenant.pengaturan as any) || {}

  const schoolInfo = {
    address: tenant.alamat || '',
    phone: tenant.telepon || '',
    email: tenant.email || '',
    mapEmbed: pengaturan.mapEmbed || '',
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
