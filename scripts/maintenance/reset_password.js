/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const prisma = new PrismaClient()

async function main() {
  const hashedPassword = await bcrypt.hash('admin123', 12)
  
  // Use the specific ID found in previous check
  const user = await prisma.user.update({
    where: { id: '79ed9fa9-1ea0-4dc9-9264-b24e50eef35b' },
    data: { passwordHash: hashedPassword }
  })
  
  console.log(`Password for user ${user.username} has been reset to admin123`)
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect())
