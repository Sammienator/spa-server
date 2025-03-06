const express = require("express");
const router = express.Router();
const Appointment = require("../models/Appointment");

// Existing GET endpoint for appointments list
router.get("/", async (req, res) => {
  try {
    const { startDate, endDate, status, paymentStatus, clientName, phone } = req.query;
    const query = {};
    if (startDate) query.startTime = { $gte: new Date(startDate) }; // Single date filter
    if (endDate) query.startTime = { $lte: new Date(endDate) }; // Optional end date for completeness
    if (status) query.status = status;
    if (paymentStatus) query.paymentStatus = paymentStatus;
    if (clientName) query["clientId.name"] = { $regex: clientName, $options: "i" }; // Filter by client name (case-insensitive)
    if (phone) query["clientId.phone"] = { $regex: phone, $options: "i" }; // Filter by phone number (case-insensitive)
    console.log("MongoDB query:", query);
    const appointments = await Appointment.find(query)
      .populate("clientId", "name email phone areasOfConcern")
      .sort({ startTime: 1 });
    console.log("Appointments found:", appointments);
    res.status(200).json(appointments);
  } catch (error) {
    console.error("Error fetching appointments:", error);
    res.status(500).json({ message: "Failed to fetch appointments", error: error.message });
  }
});

// New endpoint for client appointment history
router.get("/client/:clientId", async (req, res) => {
  try {
    const clientId = req.params.clientId;
    const history = await Appointment.find({ clientId })
      .populate("clientId", "name email phone areasOfConcern")
      .sort({ startTime: -1 }); // Sort by most recent first
    console.log("Client history found:", history);
    res.status(200).json(history);
  } catch (error) {
    console.error("Error fetching client history:", error);
    res.status(500).json({ message: "Failed to fetch client history", error: error.message });
  }
});

// Updated POST endpoint to ensure date and time are provided
router.post("/", async (req, res) => {
  try {
    const { clientId, treatment, duration, startTime, paymentStatus } = req.body;
    if (!clientId || !treatment || !duration || !startTime) {
      return res.status(400).json({ message: "Missing required fields (clientId, treatment, duration, and startTime are required)" });
    }

    // Validate startTime format (ISO 8601 or Date string)
    const parsedStartTime = new Date(startTime);
    if (isNaN(parsedStartTime.getTime())) {
      return res.status(400).json({ message: "Invalid startTime format. Use ISO 8601 or a valid Date string (e.g., '2025-03-15T14:00:00Z')" });
    }

    const appointment = new Appointment({
      clientId,
      treatment,
      duration,
      startTime: parsedStartTime,
      paymentStatus: paymentStatus || "Unpaid"
    });
    await appointment.save();
    res.status(201).json(appointment);
  } catch (error) {
    console.error("Error creating appointment:", error);
    if (error.message.includes("This time slot is unavailable")) {
      res.status(400).json({ message: error.message });
    } else {
      res.status(400).json({ message: "Failed to create appointment", error: error.message });
    }
  }
});

// Existing PUT endpoint (unchanged)
router.put("/:id", async (req, res) => {
  try {
    const { status, paymentStatus } = req.body;
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status, paymentStatus },
      { new: true, runValidators: true }
    );
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }
    res.status(200).json(appointment);
  } catch (error) {
    console.error("Error updating appointment:", error);
    res.status(400).json({ message: "Failed to update appointment", error: error.message });
  }
});

// Existing DELETE endpoint (unchanged)
router.delete("/:id", async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndDelete(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }
    res.status(200).json({ message: "Appointment deleted" });
  } catch (error) {
    console.error("Error deleting appointment:", error);
    res.status(400).json({ message: "Failed to delete appointment", error: error.message });
  }
});

module.exports = router;