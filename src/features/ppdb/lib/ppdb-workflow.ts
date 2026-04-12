export type PpdbWorkflowState =
  | 'REGISTRATION_CREATED'
  | 'PAYMENT_PENDING'
  | 'PAYMENT_REVIEW'
  | 'FULL_FORM_UNLOCKED'
  | 'FULL_FORM_IN_PROGRESS'
  | 'SUBMITTED_FOR_REVIEW'
  | 'VERIFIED_READY_FOR_DECISION'
  | 'REJECTED'
  | 'ACCEPTED_AWAITING_REENROLLMENT_BILL'
  | 'REENROLLMENT_PAYMENT_PENDING'
  | 'READY_TO_SYNC'
  | 'SYNCED_TO_STUDENT'

type WorkflowPayment = {
  status: string
}

type WorkflowTagihan = {
  jenis: string
  status: string
  pembayarans?: WorkflowPayment[]
}

type WorkflowPersyaratan = {
  id: string
  isWajib: boolean
}

type WorkflowBerkas = {
  persyaratanId: string
  status: string
  persyaratan?: {
    isWajib?: boolean
  } | null
}

type WorkflowRecord = {
  status: string
  dataFormulir?: unknown
  dataOrangtua?: unknown
  tagihanPpdbs?: WorkflowTagihan[]
  berkas?: WorkflowBerkas[]
  periode?: {
    persyaratanBerkas?: WorkflowPersyaratan[]
  } | null
}

type WorkflowOptions = {
  isSyncedToStudent?: boolean
}

type WorkflowMeta = {
  label: string
  description: string
  nextAction: string
}

export type PpdbWorkflowSnapshot = {
  state: PpdbWorkflowState
  label: string
  description: string
  nextAction: string
  flags: {
    isRegistrationFeePaid: boolean
    hasStartedFullForm: boolean
    hasSubmittedFullForm: boolean
    requiredDocumentsUploadedCount: number
    requiredDocumentsApprovedCount: number
    requiredDocumentsTotal: number
    hasRejectedRequiredDocument: boolean
    isEligibleForVerification: boolean
    isEligibleForAcceptance: boolean
    hasReenrollmentBill: boolean
    isReenrollmentPaid: boolean
    isSyncedToStudent: boolean
  }
}

type WorkflowSubmissionMeta = {
  mode?: unknown
  updatedAt?: unknown
  finalSubmittedAt?: unknown
}

const WORKFLOW_META: Record<PpdbWorkflowState, WorkflowMeta> = {
  REGISTRATION_CREATED: {
    label: 'Pendaftaran Dibuat',
    description: 'Pendaftaran awal sudah dibuat dan invoice formulir sudah tersedia.',
    nextAction: 'Buka invoice dan lanjutkan pembayaran formulir.',
  },
  PAYMENT_PENDING: {
    label: 'Menunggu Pembayaran',
    description: 'Tagihan formulir masih aktif dan bukti pembayaran belum dikirim.',
    nextAction: 'Upload bukti pembayaran formulir.',
  },
  PAYMENT_REVIEW: {
    label: 'Pembayaran Sedang Ditinjau',
    description: 'Bukti pembayaran sudah masuk dan sedang diverifikasi admin.',
    nextAction: 'Tunggu verifikasi pembayaran dari admin.',
  },
  FULL_FORM_UNLOCKED: {
    label: 'Form Lengkap Terbuka',
    description: 'Pembayaran formulir sudah valid dan form lengkap sudah bisa diisi.',
    nextAction: 'Mulai isi data siswa, data orang tua, dan upload berkas.',
  },
  FULL_FORM_IN_PROGRESS: {
    label: 'Form Lengkap Belum Selesai',
    description: 'Sebagian data sudah diisi, tetapi formulir lengkap belum siap direview.',
    nextAction: 'Lengkapi field wajib dan semua berkas yang diperlukan.',
  },
  SUBMITTED_FOR_REVIEW: {
    label: 'Menunggu Review Admin',
    description: 'Data dan berkas sudah terkirim dan sedang menunggu peninjauan admin.',
    nextAction: 'Tunggu proses review dari admin sekolah.',
  },
  VERIFIED_READY_FOR_DECISION: {
    label: 'Siap Keputusan',
    description: 'Administrasi dan berkas sudah lolos verifikasi dan menunggu keputusan akhir.',
    nextAction: 'Tunggu pengumuman hasil seleksi.',
  },
  REJECTED: {
    label: 'Tidak Diterima',
    description: 'Proses PPDB sudah selesai dan pendaftar dinyatakan tidak diterima.',
    nextAction: 'Lihat pengumuman dari sekolah untuk detail hasil.',
  },
  ACCEPTED_AWAITING_REENROLLMENT_BILL: {
    label: 'Diterima',
    description: 'Pendaftar dinyatakan diterima dan menunggu instruksi daftar ulang.',
    nextAction: 'Tunggu tagihan atau instruksi daftar ulang dari sekolah.',
  },
  REENROLLMENT_PAYMENT_PENDING: {
    label: 'Menunggu Daftar Ulang',
    description: 'Tagihan daftar ulang sudah dibuat tetapi belum lunas.',
    nextAction: 'Selesaikan pembayaran daftar ulang.',
  },
  READY_TO_SYNC: {
    label: 'Siap Menjadi Siswa',
    description: 'Semua kewajiban PPDB sudah selesai dan pendaftar siap diaktifkan sebagai siswa.',
    nextAction: 'Tunggu admin menyinkronkan data ke siswa aktif.',
  },
  SYNCED_TO_STUDENT: {
    label: 'Sudah Menjadi Siswa',
    description: 'Proses PPDB selesai dan data sudah disinkronkan ke siswa aktif.',
    nextAction: 'Lanjutkan ke portal siswa atau area akademik yang tersedia.',
  },
}

function getObjectRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null
}

function getSubmissionMeta(record: WorkflowRecord): WorkflowSubmissionMeta | null {
  const formulir = getObjectRecord(record.dataFormulir)
  const orangtua = getObjectRecord(record.dataOrangtua)
  const formulirMeta = getObjectRecord(formulir?._submission)
  const orangtuaMeta = getObjectRecord(orangtua?._submission)

  return (formulirMeta ?? orangtuaMeta) as WorkflowSubmissionMeta | null
}

function hasMeaningfulObjectValue(value: unknown) {
  const record = getObjectRecord(value)
  if (!record) return false

  return Object.entries(record).some(([key, entryValue]) => {
    if (key === '_submission') return false
    if (typeof entryValue === 'string') return entryValue.trim().length > 0
    return entryValue !== null && entryValue !== undefined
  })
}

export function derivePpdbWorkflow(
  record: WorkflowRecord,
  options: WorkflowOptions = {},
): PpdbWorkflowSnapshot {
  const tagihanPpdbs = record.tagihanPpdbs ?? []
  const berkas = record.berkas ?? []
  const persyaratanBerkas = record.periode?.persyaratanBerkas ?? []
  const isSyncedToStudent = options.isSyncedToStudent ?? false

  const registrationBill = tagihanPpdbs.find((tagihan) => tagihan.jenis === 'PENDAFTARAN') ?? null
  const reenrollmentBill = tagihanPpdbs.find((tagihan) => tagihan.jenis === 'DAFTAR_ULANG') ?? null

  const isRegistrationFeePaid = registrationBill?.status === 'LUNAS'
  const hasPendingRegistrationPayment = (registrationBill?.pembayarans ?? []).some(
    (pembayaran) => pembayaran.status === 'PENDING',
  ) || registrationBill?.status === 'MENUNGGU_VERIFIKASI'
  const hasReenrollmentBill = !!reenrollmentBill
  const isReenrollmentPaid = reenrollmentBill?.status === 'LUNAS'

  const requiredDocumentIds = new Set(
    persyaratanBerkas.filter((persyaratan) => persyaratan.isWajib).map((persyaratan) => persyaratan.id),
  )

  const uploadedRequiredDocuments = berkas.filter((item) => requiredDocumentIds.has(item.persyaratanId))
  const requiredDocumentsUploadedCount = uploadedRequiredDocuments.length
  const requiredDocumentsApprovedCount = uploadedRequiredDocuments.filter((item) => item.status === 'DITERIMA').length
  const hasRejectedRequiredDocument = uploadedRequiredDocuments.some((item) => item.status === 'DITOLAK')
  const requiredDocumentsTotal = requiredDocumentIds.size

  const submissionMeta = getSubmissionMeta(record)
  const hasFinalSubmitted = submissionMeta?.mode === 'final'

  const hasStartedFullForm =
    hasMeaningfulObjectValue(record.dataFormulir) ||
    hasMeaningfulObjectValue(record.dataOrangtua) ||
    berkas.length > 0

  const hasSubmittedFullForm =
    hasFinalSubmitted &&
    hasMeaningfulObjectValue(record.dataFormulir) &&
    hasMeaningfulObjectValue(record.dataOrangtua) &&
    requiredDocumentsUploadedCount >= requiredDocumentsTotal

  const isEligibleForVerification =
    isRegistrationFeePaid &&
    hasSubmittedFullForm &&
    !hasRejectedRequiredDocument

  const isEligibleForAcceptance =
    record.status === 'TERVERIFIKASI' &&
    isRegistrationFeePaid &&
    requiredDocumentsApprovedCount >= requiredDocumentsTotal &&
    !hasRejectedRequiredDocument

  let state: PpdbWorkflowState

  if (isSyncedToStudent) {
    state = 'SYNCED_TO_STUDENT'
  } else if (record.status === 'DITOLAK') {
    state = 'REJECTED'
  } else if (record.status === 'DITERIMA') {
    if (!hasReenrollmentBill) {
      state = 'ACCEPTED_AWAITING_REENROLLMENT_BILL'
    } else if (!isReenrollmentPaid) {
      state = 'REENROLLMENT_PAYMENT_PENDING'
    } else {
      state = 'READY_TO_SYNC'
    }
  } else if (record.status === 'TERVERIFIKASI') {
    state = 'VERIFIED_READY_FOR_DECISION'
  } else if (!registrationBill) {
    state = 'REGISTRATION_CREATED'
  } else if (hasPendingRegistrationPayment) {
    state = 'PAYMENT_REVIEW'
  } else if (!isRegistrationFeePaid) {
    state = hasStartedFullForm ? 'REGISTRATION_CREATED' : 'PAYMENT_PENDING'
  } else if (!hasStartedFullForm) {
    state = 'FULL_FORM_UNLOCKED'
  } else if (!hasSubmittedFullForm) {
    state = 'FULL_FORM_IN_PROGRESS'
  } else {
    state = 'SUBMITTED_FOR_REVIEW'
  }

  return {
    state,
    ...WORKFLOW_META[state],
    flags: {
      isRegistrationFeePaid,
      hasStartedFullForm,
      hasSubmittedFullForm,
      requiredDocumentsUploadedCount,
      requiredDocumentsApprovedCount,
      requiredDocumentsTotal,
      hasRejectedRequiredDocument,
      isEligibleForVerification,
      isEligibleForAcceptance,
      hasReenrollmentBill,
      isReenrollmentPaid,
      isSyncedToStudent,
    },
  }
}
