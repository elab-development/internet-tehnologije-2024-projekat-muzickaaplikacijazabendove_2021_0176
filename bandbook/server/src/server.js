import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { prisma } from './lib/prisma.js';





const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(morgan('dev'));

app.get('/health', async (_req, res) => {
  await prisma.$queryRaw`SELECT 1`;
  res.json({
    ok: true,
    service: 'bandbook-api',
    time: new Date().toISOString(),
  });
});

const PORT = Number(process.env.PORT || 4000);
app.listen(PORT, () => {
  console.log(`Bandbook API listening on http://localhost:${PORT}`);
});