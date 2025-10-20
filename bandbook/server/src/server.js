import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { prisma } from './lib/prisma.js';
import authRoutes from './routes/auth.routes.js';
import bandRoutes from './routes/band.routes.js';
import userRouter from './routes/user.routes.js';
import reviewsRouter from './routes/review.routes.js';
import favoritesRouter from './routes/favorites.routes.js';

dotenv.config();

const app = express();

const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'http://localhost:5173';
app.use(cors({ origin: FRONTEND_ORIGIN, credentials: true }));

app.use(express.json());
app.use(cookieParser());
app.use(morgan('dev'));

app.get('/health', async (_req, res) => {
  await prisma.$queryRaw`SELECT 1`;
  res.json({
    ok: true,
    service: 'bandbook-api',
    time: new Date().toISOString(),
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/bands', bandRoutes);
app.use('/api/users', userRouter);
app.use('/api', reviewsRouter);
app.use('/api', favoritesRouter);

const PORT = Number(process.env.PORT || 4000);
app.listen(PORT, () => {
  console.log(`Bandbook API listening on http://localhost:${PORT}`);
});
