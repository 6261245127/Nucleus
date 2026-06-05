import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth';
import campaignRoutes from './routes/campaign';
import taskRoutes from './routes/task';
import adminRoutes from './routes/admin';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/admin', adminRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'CreatorBoost API is running' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
