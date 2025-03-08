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
  'https://spa-client-git-main-sammienators-projects.vercel.app',
  'https://www.shunem.vercel.app',
  'http://localhost:3000',
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow if no origin (e.g., curl) or if in allowed list
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true); // Return true to set the origin header dynamically
    } else {
      console.log(`Blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Request logging
app.use((req, res, next) => {
  console.log(`Request Origin: ${req.headers.origin}`);
  console.log(`${req.method} ${req.path}`);
  next();
});

app.use(express.json());

// Basic route
app.get('/', (req, res) => res.status(200).send('Backend is running!'));

// Routes
app.use('/appointments', appointmentRoutes);
app.use('/clients', clientRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server Error:', err.message);
  res.status(500).json({ message: 'Internal Server Error', error: err.message });
});

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('MONGO_URI:', process.env.MONGO_URI);
});