const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const users = await prisma.user.findMany({
    where: {
      username: { in: ['parentdemo', 'parentfinal4'] }
    }
  })
  console.log(JSON.stringify(users, null, 2))
}

main().finally(() => prisma.$disconnect())
