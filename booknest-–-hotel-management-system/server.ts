import express from 'express';
import cors from 'cors';
import path from 'path';
import { createServer as createViteServer } from 'vite';

import authRoutes from './src/routes/auth';
import roomRoutes from './src/routes/rooms';
import guestRoutes from './src/routes/guests';
import bookingRoutes from './src/routes/bookings';
import checkinRoutes from './src/routes/checkin';
import paymentRoutes from './src/routes/payments';
import employeeRoutes from './src/routes/employees';
import housekeepingRoutes from './src/routes/housekeeping';
import maintenanceRoutes from './src/routes/maintenance';
import inventoryRoutes from './src/routes/inventory';
import serviceRoutes from './src/routes/services';
import reportRoutes from './src/routes/reports';
import systemRoutes from './src/routes/system';

import { getDb } from './src/db/database';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Initialize DB asynchronously before listening
  await getDb();

  app.use(cors());
  app.use(express.json());

  // Mount API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/rooms', roomRoutes);
  app.use('/api/guests', guestRoutes);
  app.use('/api/bookings', bookingRoutes);
  app.use('/api', checkinRoutes);
  app.use('/api/payments', paymentRoutes);
  app.use('/api/employees', employeeRoutes);
  app.use('/api/housekeeping', housekeepingRoutes);
  app.use('/api/maintenance', maintenanceRoutes);
  app.use('/api/inventory', inventoryRoutes);
  app.use('/api/services', serviceRoutes);
  app.use('/api/reports', reportRoutes);
  app.use('/api/system', systemRoutes);

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', system: 'BookNest HMS', timestamp: new Date().toISOString() });
  });

  // Vite middleware for development vs static production serving
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        // Check-in and check-out persist records to this JSON database.  It is
        // runtime data, not client source, so watching it would force a full
        // browser reload and discard the generated invoice modal.
        watch: {
          ignored: ['**/data/booknest.json']
        }
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[BookNest HMS] Server running smoothly on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[BookNest HMS] Server startup failed:', err);
});


