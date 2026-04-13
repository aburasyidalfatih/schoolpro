import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db/prisma'
import { isSuperAdmin, logPlatformAudit } from '@/lib/super-admin'

type ReviewDecision = 'approve' | 'reject' | 'request_revision'

function normalizeDecision(value: unknown): ReviewDecision {
  if (value === 'reject') return 'reject'
  if (value === 'request_revision') return 'request_revision'
  return 'approve'
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!isSuperAdmin(session)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const actor = session?.user as { id?: unknown; nama?: unknown; name?: unknown; role?: unknown } | undefined
    const { id } = await params
    const body = await req.json()
    const decision = normalizeDecision(body?.decision)
    const reviewNotes = body?.reviewNotes ? String(body.reviewNotes).trim() : ''
    const revisionNotes = body?.revisionNotes ? String(body.revisionNotes).trim() : ''
    const rejectedReason = body?.rejectedReason ? String(body.rejectedReason).trim() : ''

    const application = await prisma.tenantApplication.findUnique({
      where: { id },
    })

    if (!application) {
      return NextResponse.json({ error: 'Aplikasi tenant tidak ditemukan' }, { status: 404 })
    }

    if (application.status === 'PROVISIONED') {
      return NextResponse.json({ error: 'Aplikasi yang sudah diprovision tidak bisa direview ulang' }, { status: 400 })
    }

    if (decision === 'reject' && !rejectedReason) {
      return NextResponse.json({ error: 'Alasan penolakan wajib diisi' }, { status: 400 })
    }

    if (decision === 'request_revision' && !revisionNotes) {
      return NextResponse.json({ error: 'Catatan revisi wajib diisi' }, { status: 400 })
    }

    const nextStatus =
      decision === 'approve' ? 'APPROVED' : decision === 'reject' ? 'REJECTED' : 'REVISION_REQUESTED'

    const updated = await prisma.tenantApplication.update({
      where: { id: application.id },
      data: {
        status: nextStatus,
        reviewedAt: new Date(),
        reviewedByUserId: typeof actor?.id === 'string' ? actor.id : null,
        reviewNotes: reviewNotes || null,
        revisionNotes: decision === 'request_revision' ? revisionNotes : null,
        rejectedReason: decision === 'reject' ? rejectedReason : null,
      },
    })

    await logPlatformAudit({
      actorUserId: typeof actor?.id === 'string' ? actor.id : null,
      actorName:
        typeof actor?.nama === 'string'
          ? actor.nama
          : typeof actor?.name === 'string'
            ? actor.name
            : null,
      actorRole: typeof actor?.role === 'string' ? actor.role : null,
      action:
        decision === 'approve'
          ? 'TENANT_APPLICATION_APPROVED'
          : decision === 'reject'
            ? 'TENANT_APPLICATION_REJECTED'
            : 'TENANT_APPLICATION_REVISION_REQUESTED',
      targetType: 'TENANT_APPLICATION',
      targetId: application.id,
      summary:
        decision === 'approve'
          ? `Aplikasi tenant ${application.namaSekolah} disetujui`
          : decision === 'reject'
            ? `Aplikasi tenant ${application.namaSekolah} ditolak`
            : `Aplikasi tenant ${application.namaSekolah} diminta revisi`,
      metadata: {
        applicationCode: application.applicationCode,
        previousStatus: application.status,
        nextStatus,
        slugRequest: application.slugRequest,
        reviewNotes: reviewNotes || null,
        revisionNotes: decision === 'request_revision' ? revisionNotes : null,
        rejectedReason: decision === 'reject' ? rejectedReason : null,
      },
    })

    return NextResponse.json({
      data: {
        id: updated.id,
        status: updated.status,
        reviewedAt: updated.reviewedAt,
      },
      message:
        decision === 'approve'
          ? 'Aplikasi tenant disetujui dan siap masuk tahap provisioning'
          : decision === 'reject'
            ? 'Aplikasi tenant berhasil ditolak'
            : 'Catatan revisi berhasil dikirim ke aplikasi tenant',
    })
  } catch (error) {
    console.error('[SUPER_ADMIN_TENANT_APPLICATION_REVIEW_PUT]', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
