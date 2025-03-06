import express from 'express';
import Appointment from '../models/Appointment.js';

const router = express.Router();

// GET all appointments
router.get('/', async (req, res) => {
  try {
    const { startDate, endDate, status, paymentStatus, clientName, phone } = req.query;
    const query = {};
    if (startDate) query.startTime = { $gte: new Date(startDate) };
    if (endDate) query.startTime = { $lte: new Date(endDate) };
    if (status) query.status = status;
    if (paymentStatus) query.paymentStatus = paymentStatus;
    if (clientName) query['clientId.name'] = { $regex: clientName, $options: 'i' };
    if (phone) query['clientId.phone'] = { $regex: phone, $options: 'i' };
    console.log('MongoDB query:', query);
    const appointments = await Appointment.find(query)
      .populate('clientId', 'name email phone areasOfConcern')
      .sort({ startTime: 1 });
    console.log('Appointments found:', appointments.length);
    res.status(200).json(appointments);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ message: 'Failed to fetch appointments', error: error.message });
  }
});

// GET client appointment history
router.get('/client/:clientId', async (req, res) => {
  try {
    const clientId = req.params.clientId;
    const history = await Appointment.find({ clientId })
      .populate('clientId', 'name email phone areasOfConcern')
      .sort({ startTime: -1 });
    console.log('Client history found:', history.length);
    res.status(200).json(history);
  } catch (error) {
    console.error('Error fetching client history:', error);
    res.status(500).json({ message: 'Failed to fetch client history', error: error.message });
  }
});

// POST new appointment
router.post('/', async (req, res) => {
  try {
    const { clientId, treatment, duration, startTime, paymentStatus } = req.body;
    if (!clientId || !treatment || !duration || !startTime) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    const parsedStartTime = new Date(startTime);
    if (isNaN(parsedStartTime.getTime())) {
      return res.status(400).json({ message: 'Invalid startTime format' });
    }
    const appointment = new Appointment({
      clientId,
      treatment,
      duration,
      startTime: parsedStartTime,
      paymentStatus: paymentStatus || 'Unpaid',
    });
    await appointment.save();
    console.log('Appointment created:', appointment._id);
    res.status(201).json(appointment);
  } catch (error) {
    console.error('Error creating appointment:', error);
    res.status(400).json({ message: 'Failed to create appointment', error: error.message });
  }
});

// PUT update appointment
router.put('/:id', async (req, res) => {
  try {
    const { status, paymentStatus } = req.body;
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status, paymentStatus },
      { new: true, runValidators: true }
    );
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    console.log('Appointment updated:', appointment._id);
    res.status(200).json(appointment);
  } catch (error) {
    console.error('Error updating appointment:', error);
    res.status(400).json({ message: 'Failed to update appointment', error: error.message });
  }
});

// DELETE appointment
router.delete('/:id', async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndDelete(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    console.log('Appointment deleted:', appointment._id);
    res.status(200).json({ message: 'Appointment deleted' });
  } catch (error) {
    console.error('Error deleting appointment:', error);
    res.status(400).json({ message: 'Failed to delete appointment', error: error.message });
  }
});

export default router;