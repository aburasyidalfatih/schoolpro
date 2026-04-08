const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const lastPendaftar = await prisma.pendaftarPpdb.findFirst({
    orderBy: { createdAt: 'desc' }
  })
  console.log(JSON.stringify(lastPendaftar, null, 2))
}

main().finally(() => prisma.$disconnect())
