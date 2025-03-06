import express from 'express';
import Client from '../models/Client.js';

const router = express.Router();

// GET clients (with optional search)
router.get('/', async (req, res) => {
  try {
    const { search } = req.query;
    const query = search ? {
      $or: [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ],
    } : {};
    const clients = await Client.find(query);
    res.status(200).json(clients);
  } catch (error) {
    console.error('Error fetching clients:', error);
    res.status(500).json({ message: 'Failed to fetch clients', error: error.message });
  }
});

// POST new client
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, areasOfConcern } = req.body;
    if (!name || !email || !phone) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    const client = new Client({ name, email, phone, areasOfConcern });
    await client.save();
    res.status(201).json(client);
  } catch (error) {
    console.error('Error creating client:', error);
    res.status(400).json({ message: 'Failed to create client', error: error.message });
  }
});

export default router;