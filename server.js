import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import appointmentRoutes from './routes/appointments.js';
import clientRoutes from './routes/clients.js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

// CORS configuration
const allowedOrigins = [
  'https://spa-client-git-main-sammienators-projects.vercel.app', // New deployment URL
  
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g., curl) or if origin is in allowed list
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, origin);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use((req, res, next) => {
  console.log(`Request Origin: ${req.headers.origin}`);
  console.log(`${req.method} ${req.path}`);
  next();
});

app.use(express.json());

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