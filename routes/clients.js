import express from "express";
import Client from "../models/Client.js";

const router = express.Router();

/**
 * @route POST /api/clients
 * @desc Add a new client
 * @access Public
 * @body {name, email, phone, areasOfConcern}
 * @returns {client} 201 - New client created
 * @returns {error} 400 - Validation error
 */
router.post("/", async (req, res) => {
  try {
    const { name, email, phone, areasOfConcern } = req.body;
    if (!name || !email) {
      return res.status(400).json({ message: "Name and email are required" });
    }
    const client = new Client({ name, email, phone, areasOfConcern });
    await client.save();
    res.status(201).json(client);
  } catch (error) {
    res.status(400).json({ message: "Failed to add client", error: error.message });
  }
});

/**
 * @route GET /api/clients
 * @desc Get clients with search
 * @access Public
 * @query {search}
 * @returns {clients} 200 - List of clients
 * @returns {error} 500 - Server error
 */
router.get("/", async (req, res) => {
  try {
    const { search } = req.query;
    const query = search
      ? { $or: [{ name: { $regex: search, $options: "i" } }, { email: { $regex: search, $options: "i" } }] }
      : {};
    const clients = await Client.find(query).sort({ createdAt: -1 }); // Sort by most recent
    res.status(200).json(clients);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch clients", error: error.message });
  }
});

export default router;