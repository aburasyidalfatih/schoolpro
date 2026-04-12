/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const users = await prisma.user.findMany({
    where: {
      OR: [
        { role: 'USER' },
        { role: 'WALI' }
      ]
    },
    select: {
      id: true,
      username: true,
      nama: true,
      role: true
    }
  })
  console.log(JSON.stringify(users, null, 2))
}

main().finally(() => prisma.$disconnect())
