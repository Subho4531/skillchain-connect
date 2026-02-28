import express from 'express';
import cors from 'cors';
import { config } from './config/env';
import authRoutes from './routes/auth';
import credentialRoutes from './routes/credentials';
import adminRoutes from './routes/admin';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/credentials', credentialRoutes);
app.use('/api/admin', adminRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', appId: config.appId });
});

app.listen(config.port, () => {
  console.log(`✅ Server running on port ${config.port}`);
  console.log(`📋 App ID: ${config.appId || 'Not configured'}`);
  console.log(`👤 Platform Admin: ${config.platformAdminWallet}`);
  console.log(`🏛️  College Admin: ${config.collegeAdminWallet}`);
});
