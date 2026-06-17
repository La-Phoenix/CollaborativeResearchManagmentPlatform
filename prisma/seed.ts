import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import process from 'process';

import 'dotenv/config';
import { prisma } from '../src/db';

async function main() {
  console.log('🌱 Starting database seed...');

  // Create a default Admin/PI user
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@crmp.com' },
    update: {},
    create: {
      email: 'admin@crmp.com',
      firstName: 'System',
      lastName: 'Admin',
      passwordHash: hashedPassword,
    },
  });

  console.log('✅ Created default admin user: admin@crmp.com / admin123');

  // Create a default demo project
  const demoProject = await prisma.project.create({
    data: {
      title: 'CRMP Demo Project',
      description: 'This is an automatically seeded demonstration project.',
      status: 'ACTIVE',
      members: {
        create: {
          userId: adminUser.id,
          role: 'PI',
        }
      }
    }
  });

  console.log('✅ Created demo project with PI role assigned.');

  console.log('🌱 Database seeding completed successfully.');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
