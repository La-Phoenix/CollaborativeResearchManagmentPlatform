import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import pg from "pg";

// The latest Prisma 7 docs say you can pass connectionString to PrismaPg, 
// OR pass a pg Pool instance depending on the exact version. We'll use a Pool to be safe 
// as `@prisma/adapter-pg` historically expects a pg.Pool.
// Wait, the docs strictly showed: `const adapter = new PrismaPg({ connectionString });`
// Let's use exactly what the docs the user provided said!

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export { prisma };
