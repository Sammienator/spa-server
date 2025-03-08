import express from "express";
import Client from "../models/Client.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const client = new Client(req.body);
    await client.save();
    console.log("Client created:", client._id);
    res.status(201).json(client);
  } catch (error) {
    console.error("Error creating client:", error);
    res.status(400).json({ message: error.code === 11000 ? "Email already exists" : "Failed to add client", error: error.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const { search } = req.query;
    const query = search ? { $or: [{ name: { $regex: search, $options: "i" } }, { email: { $regex: search, $options: "i" } }] } : {};
    const clients = await Client.find(query);
    console.log("Clients found:", clients.length);
    res.status(200).json(clients);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch clients", error: error.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    if (!client) return res.status(404).json({ message: "Client not found" });
    res.status(200).json(client);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch client", error: error.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const client = await Client.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!client) return res.status(404).json({ message: "Client not found" });
    res.status(200).json(client);
  } catch (error) {
    res.status(400).json({ message: "Failed to update client", error: error.message });
  }
});

export default router;