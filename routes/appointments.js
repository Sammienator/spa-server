import express from "express";
import Appointment from "../models/Appointment.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const { clientId, startDate, endDate } = req.query;
    const query = {};
    if (clientId) query.clientId = clientId;
    if (startDate && endDate) {
      query.startTime = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }
    const appointments = await Appointment.find(query).populate("clientId");
    res.status(200).json(appointments);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch appointments", error: error.message });
  }
});

// Support /appointments/client/:clientId as seen in logs
router.get("/client/:clientId", async (req, res) => {
  try {
    const appointments = await Appointment.find({ clientId: req.params.clientId }).populate("clientId");
    if (!appointments) return res.status(404).json({ message: "No appointments found for this client" });
    res.status(200).json(appointments);
  } catch (error) {
    res.status(400).json({ message: "Failed to fetch client appointments", error: error.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const appointment = new Appointment(req.body);
    await appointment.save();
    res.status(201).json(appointment);
  } catch (error) {
    res.status(400).json({ message: "Failed to create appointment", error: error.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).populate("clientId");
    if (!appointment) return res.status(404).json({ message: "Appointment not found" });
    res.status(200).json(appointment);
  } catch (error) {
    res.status(400).json({ message: "Failed to update appointment", error: error.message });
  }
});

export default router;