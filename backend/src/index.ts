import dns from 'node:dns';
try {
  dns.setDefaultResultOrder('ipv4first');
} catch (_e) {
  // ignore
}

import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import routes from './routes';
import { errorHandler } from './middlewares/error.middleware';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(
  cors({
    origin: '*',
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// API Routes
app.use('/api', routes);

// Root greeting
app.get('/', (_req, res) => {
  res.json({
    message: 'Welcome to Smart Travel Recommendation & Itinerary Planning API 🚀',
    version: '1.0.0',
    documentation: '/api/health',
  });
});

// Central Error Handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`🚀 Smart Travel Server running on http://localhost:${PORT}`);
  console.log(`📍 API Health Endpoint: http://localhost:${PORT}/api/health`);
  console.log(`======================================================\n`);
});

export default app;
