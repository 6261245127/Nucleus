import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';

// Load .env from backend root explicitly
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const prisma = new PrismaClient();

export default prisma;
