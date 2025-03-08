import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import appointmentRoutes from './routes/appointments.js';
import clientRoutes from './routes/clients.js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

app.use(cors({ origin: 'https://spa-client-jpmrpuylf-sammienators-projects.vercel.app' }));
app.use(express.json());

app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

app.get('/', (req, res) => res.status(200).send('Backend is running!'));

app.use('/appointments', appointmentRoutes);
app.use('/clients', clientRoutes);

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('MONGO_URI:', process.env.MONGO_URI);
});