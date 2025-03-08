import express from "express";
import Appointment from "../models/Appointment.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const appointments = await Appointment.find().populate("clientId");
    res.status(200).json(appointments);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch appointments", error: error.message });
  }
});

// ... other routes like POST ...

router.put("/:id", async (req, res) => {
  try {
    const { paymentStatus } = req.body;
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { paymentStatus },
      { new: true, runValidators: true }
    ).populate("clientId");
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }
    res.status(200).json(appointment);
  } catch (error) {
    console.error("Error updating appointment:", error);
    res.status(400).json({ message: "Failed to update appointment", error: error.message });
  }
});

export default router;