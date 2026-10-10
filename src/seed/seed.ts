import 'dotenv/config';
import * as bcrypt from 'bcrypt';
import { PrismaNeon } from '@prisma/adapter-neon';
import { PrismaClient } from '../generated/prisma/client';
import { Role } from '../generated/prisma/enums';
import { buildProducts } from './products.data';

const prisma = new PrismaClient({
  adapter: new PrismaNeon({ connectionString: process.env.DATABASE_URL! }),
});

// Creates the first admin, or promotes the account if the email already exists
async function seedAdmin() {
  const email = process.env.SEED_ADMIN_EMAIL?.toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD;

  if (!email || !password) {
    console.log(
      'SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD not set: skipping the admin',
    );
    return;
  }

  await prisma.user.upsert({
    where: { email },
    // An existing account keeps its password and is only promoted
    update: { role: Role.ADMIN },
    create: {
      name: process.env.SEED_ADMIN_NAME ?? 'Admin',
      email,
      password: await bcrypt.hash(password, 10),
      role: Role.ADMIN,
    },
  });
  console.log(`Admin ready: ${email}`);
}

async function seedProducts() {
  await prisma.product.deleteMany({});
  console.log('Cleared existing products');

  const products = buildProducts();
  await prisma.product.createMany({ data: products });
  console.log(`Created ${products.length} products`);
}

async function main() {
  // The seed wipes the products table, so it must never run against production data
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Refusing to run the seed in production');
  }

  await seedAdmin();
  await seedProducts();
}

main()
  .then(() => console.log('Seed completed successfully!'))
  .catch((error) => {
    console.error('Seed error:', error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
