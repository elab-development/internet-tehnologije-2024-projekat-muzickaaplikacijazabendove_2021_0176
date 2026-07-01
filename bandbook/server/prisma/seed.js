import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function seedAdmin() {
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

async function seedBands() {
  const bands = [
    {
      name: 'Coldplay',
      description:
        'British pop/rock band known for anthemic melodies and expansive live shows.',
      members: [
        'Chris Martin (vocals, piano)',
        'Jonny Buckland (guitar)',
        'Guy Berryman (bass)',
        'Will Champion (drums)',
      ],
      channelId: 'UCDPM_n1atn2ijUwHd0NNRQw',
      avatarUrl: 'https://api.time.com/wp-content/uploads/2023/11/COLDPLAY.jpg',
    },
    {
      name: 'Imagine Dragons',
      description:
        'Las Vegas–formed alt/arena rock band blending electronic textures with big choruses.',
      members: [
        'Dan Reynolds (vocals)',
        'Wayne Sermon (guitar)',
        'Ben McKee (bass)',
        'Daniel Platzman (drums)',
      ],
      channelId: 'UCT9zcQNlyht7fRlcjmflRSA',
      avatarUrl:
        'https://concord.com/wp-content/uploads/2021/01/imaginedragons.jpg',
    },
    {
      name: 'Maroon 5',
      description:
        'Grammy-winning pop band mixing funk, R&B and rock with radio-ready hooks.',
      members: [
        'Adam Levine (vocals, guitar)',
        'James Valentine (guitar)',
        'Jesse Carmichael (keys, guitar)',
        'Matt Flynn (drums)',
        'PJ Morton (keys)',
        'Sam Farrar (multi-instrumentalist)',
      ],
      channelId: 'UCBVjMGOIkavEAhyqpxJ73Dw',
      avatarUrl:
        'https://static.wikia.nocookie.net/whumpapedia/images/5/5d/Maroon_5.jpeg/revision/latest?cb=20211029190920',
    },
    {
      name: 'Foo Fighters',
      description:
        'American rock band led by Dave Grohl, known for high-energy performances and guitar-driven anthems.',
      members: [
        'Dave Grohl (vocals, guitar)',
        'Nate Mendel (bass)',
        'Pat Smear (guitar)',
        'Chris Shiflett (guitar)',
        'Rami Jaffee (keys)',
        'Josh Freese (drums)',
      ],
      channelId: 'UCi2KNss4Yx73NG0JARSFe0A',
      avatarUrl:
        'https://yt3.googleusercontent.com/VrlcVJaXACfgIa5QCmabKv5pHqKsnE_TN7_6HqwEQB_C8Q6ZdzxaykLf8JPMiW2lMsXmuuHLwA=s900-c-k-c0x00ffffff-no-rj',
    },
  ];

  for (const band of bands) {
    await prisma.band.upsert({
      where: { channelId: band.channelId },
      update: {
        name: band.name,
        description: band.description,
        members: band.members,
        avatarUrl: band.avatarUrl,
      },
      create: {
        name: band.name,
        description: band.description,
        members: band.members,
        channelId: band.channelId,
        avatarUrl: band.avatarUrl,
      },
    });
  }

  console.log(`Seed: upserted ${bands.length} bands`);
}

async function main() {
  await seedAdmin();
  await seedBands();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });