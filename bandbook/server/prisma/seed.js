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
      category: 'pop-rock',
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
      category: 'alternative rock',
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
        'https://www.timeoutdubai.com/cloud/timeoutdubai/2024/12/06/maroon-5.jpg',
      category: 'pop',
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
      category: 'alternative rock',
    },
    {
      name: 'Linkin Park',
      description:
        'Genre-blending rock band combining heavy riffs, electronics and hip-hop elements; one of the best-selling artists of the 2000s.',
      members: [
        'Mike Shinoda (vocals, keys, guitar)',
        'Brad Delson (guitar)',
        'Dave “Phoenix” Farrell (bass)',
        'Joe Hahn (turntables, samples)',
        'Rob Bourdon (drums)',
        'Chester Bennington (vocals; in memoriam)',
      ],
      channelId: 'UCZU9T1ceaOgwfLRq7OKFU4Q',
      avatarUrl:
        'https://cdn.sanity.io/images/x6mh5oiy/production/36b35304ed121ff7e29f333a450fea9628a42bfd-1920x1280.jpg',
      category: 'alternative rock',
    },
    {
      name: 'The Killers',
      description:
        'Las Vegas indie/alt-rock outfit famed for widescreen anthems and synth-driven hooks.',
      members: [
        'Brandon Flowers (vocals, keys)',
        'Dave Keuning (guitar)',
        'Mark Stoermer (bass)',
        'Ronnie Vannucci Jr. (drums)',
      ],
      channelId: 'UCkhyoTaWKuB-Rdbb6Z3Z5DA',
      avatarUrl:
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQW3iFQkeDpqZk3XYAmOc86JHvTLLzah5rGxA&s',
      category: 'indie rock',
    },
    {
      name: 'Arctic Monkeys',
      description:
        'Sheffield band evolving from sharp indie rock to loungey, cinematic songwriting.',
      members: [
        'Alex Turner (vocals, guitar)',
        'Jamie Cook (guitar)',
        'Nick O’Malley (bass)',
        'Matt Helders (drums)',
      ],
      channelId: 'UC-KTRBl9_6AX10-Y7IKwKdw',
      avatarUrl:
        'https://musicfeeds.com.au/wp-content/uploads/sites/7/Arctic-Monkeys-2018-Zackery-Michael.jpg',
      category: 'indie rock',
    },
    {
      name: 'Red Hot Chili Peppers',
      description:
        'Funk-rock pioneers mixing slap bass grooves with melodic alt-rock and psychedelic textures.',
      members: [
        'Anthony Kiedis (vocals)',
        'Flea (bass)',
        'John Frusciante (guitar)',
        'Chad Smith (drums)',
      ],
      channelId: 'UCEuOwB9vSL1oPKGNdONB4ig',
      avatarUrl:
        'https://consequence.net/wp-content/uploads/2022/03/section-2-2-1.jpg',
      category: 'funk rock',
    },
    {
      name: 'Muse',
      description:
        'UK trio known for bombastic, cinematic rock blending prog, electronics and operatic vocals.',
      members: [
        'Matt Bellamy (vocals, guitar, keys)',
        'Chris Wolstenholme (bass)',
        'Dominic Howard (drums)',
      ],
      channelId: 'UCGGhM6XCSJFQ6DTRffnKRIw',
      avatarUrl:
        'https://www.nme.com/wp-content/uploads/2016/09/2015Muse_Press2_270115-1.jpg',
      category: 'alternative rock',
    },
    {
      name: 'Radiohead',
      description:
        'Influential art-rock band pushing boundaries from guitar-driven alt-rock to experimental electronica.',
      members: [
        'Thom Yorke (vocals, guitar, keys)',
        'Jonny Greenwood (guitar, keys)',
        'Ed O’Brien (guitar, vocals)',
        'Colin Greenwood (bass)',
        'Philip Selway (drums)',
      ],
      channelId: 'UCq19-LqvG35A-30oyAiPiqA',
      avatarUrl:
        'https://cdn.britannica.com/98/162198-050-6452139D/Radiohead-business-models-British-performers-innovator-Internet-2012.jpg',
      category: 'art rock',
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