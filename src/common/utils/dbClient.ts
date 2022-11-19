import { PrismaClient } from '@prisma/client';
import { NODE_ENV } from 'config';

let db: PrismaClient;

if (NODE_ENV === 'production') {
  db = new PrismaClient();
} else {
  if (!global.db) {
    global.db = new PrismaClient();
  }
  db = global.db;
}
export { db };
