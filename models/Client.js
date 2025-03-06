import mongoose from "mongoose";

const clientSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    trim: true // Remove whitespace
  },
  email: { 
    type: String, 
    required: true, 
    unique: true, 
    trim: true,
    lowercase: true // Normalize email to lowercase
  },
  phone: { 
    type: String, 
    trim: true 
  },
  areasOfConcern: { 
    type: String, 
    trim: true 
  },
  createdAt: { 
    type: Date, 
    default: Date.now,
    index: true // Improve query performance for recent clients
  }
}, {
  timestamps: true // Automatically add createdAt and updatedAt
});

// Index for common queries
clientSchema.index({ email: 1, name: 1 });

export default mongoose.model("Client", clientSchema);