import cors from 'cors';
import express, { type Request, type Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

// Middleware
app.use(cors());
app.use(express.json());

interface HealthResponse {
  status: 'OK' | 'ERROR';
  timestamp: string;
  environment: string;
  uptime: number;
  version: string;
}

app.use(express.static(path.join(__dirname, '../dist')));

// Health check эндпоинт
app.get('/api/health', (_req: Request, res: Response<HealthResponse>) => {
  const healthData: HealthResponse = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    uptime: process.uptime(),
    version: process.env.npm_package_version || '0.0.0',
  };

  res.status(200).json(healthData);
});

app.get('*', (_req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, '../dist', 'index.html'));
});

app.use((err: Error, _req: Request, res: Response) => {
  console.error('Server error:', err);
  res.status(500).json({
    status: 'ERROR',
    message: 'Internal Server Error',
    timestamp: new Date().toISOString(),
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Сервер запущен на порту: ${PORT}`);
  console.log(`Проверка http://localhost:${PORT}/api/health`);
});

export default app;
