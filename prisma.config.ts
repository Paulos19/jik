import 'dotenv/config';
import { defineConfig } from 'prisma/config';

// Prisma CLI (migrate, studio) uses DIRECT_URL (port 5432, required by Supabase)
// Application runtime uses DATABASE_URL (port 6543, pooled via PgBouncer)
const isCli = process.argv.some(
  (arg) =>
    arg.includes('prisma') ||
    arg.includes('migrate') ||
    arg.includes('studio')
);

const url = isCli
  ? (process.env.DIRECT_URL || process.env.DATABASE_URL!)
  : process.env.DATABASE_URL!;

export default defineConfig({
  schema: './prisma/schema.prisma',
  migrations: {
    path: './prisma/migrations',
  },
  datasource: { url },
});
