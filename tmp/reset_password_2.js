const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const prisma = new PrismaClient()

async function main() {
  const hashedPassword = await bcrypt.hash('admin123', 12)
  
  await prisma.user.update({
    where: { id: '35255ca9-dc60-452a-b247-36bd0d3aa72c' },
    data: { passwordHash: hashedPassword }
  })
  
  console.log(`Password for user parentfinal4 has been reset to admin123`)
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect())
