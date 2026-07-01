import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminEmail = 'admin@bandbook.com';
  const exists = await prisma.user.findUnique({ where: { email: adminEmail } });

  if (!exists) {
    const passwordHash = await bcrypt.hash('admin123', 10);
    await prisma.user.create({
      data: {
        name: 'Bandbook Admin',
        email: adminEmail,
        passwordHash,
        role: 'ADMIN',
        avatarUrl: null,
      },
    });
    console.log('Seed: kreiran admin (admin@bandbook.com / admin123)');
  } else {
    console.log('Seed: admin već postoji');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });