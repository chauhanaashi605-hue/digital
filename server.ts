import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// API health endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ONLINE',
    system: 'GramTrack Rural Housing & Panchayat Monitoring API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    database: 'PostgreSQL Relational / IndexedDB Sync Gateway'
  });
});

// Demo accounts endpoint
app.get('/api/auth/demo-users', (req: Request, res: Response) => {
  res.json([
    { role: 'ADMIN', email: 'admin@gramtrack.gov.in', name: 'Rajesh Verma (IAS)' },
    { role: 'DISTRICT_OFFICER', email: 'district@gramtrack.gov.in', name: 'Priya Sharma (PCS)' },
    { role: 'FIELD_INSPECTOR', email: 'inspector@gramtrack.gov.in', name: 'Amit Kumar' }
  ]);
});

// Start listening if run directly
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`[GramTrack Server] Running on http://localhost:${PORT}`);
  });
}

export default app;
