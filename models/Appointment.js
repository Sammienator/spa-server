import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema({
  clientId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Client", 
    required: true,
    index: true // Improve query performance for filtering by client
  },
  treatment: { 
    type: String, 
    enum: ["Hot Stone Massage", "Deep Tissue Massage", "Aromatherapy Massage", "Facial"], 
    required: true 
  },
  duration: { 
    type: Number, 
    enum: [30, 60, 90, 120], 
    required: true 
  },
  startTime: { 
    type: Date, 
    required: true,
    index: true // Improve query performance for time-based filtering
  },
  endTime: { 
    type: Date, 
    required: true,
    default: function() {
      return new Date(this.startTime.getTime() + this.duration * 60000);
    }
  },
  status: { 
    type: String, 
    enum: ["In Progress", "Confirmed", "Cancelled"], 
    default: "Confirmed" 
  },
  paymentStatus: { 
    type: String, 
    enum: ["Paid", "Unpaid", "Pending"], 
    default: "Unpaid" // Added "Pending" for color coding
  },
  createdAt: { 
    type: Date, 
    default: Date.now,
    index: true // Improve query performance for recent appointments
  }
}, {
  timestamps: true // Automatically add createdAt and updatedAt
});

// Pre-save middleware to validate work hours (8:00 AM to 8:00 PM) and prevent overlapping bookings
appointmentSchema.pre('save', async function(next) {
  const startHour = this.startTime.getHours();
  const endHour = this.endTime.getHours();

  // Validate working hours (8 AM to 8 PM)
  if (startHour < 8 || startHour > 20 || endHour > 20) {
    return next(new Error("Appointments must start between 8 AM and 8 PM."));
  }

  // Check for overlapping bookings on the same date
  const startDate = new Date(this.startTime);
  startDate.setHours(0, 0, 0, 0); // Normalize to start of day
  const endDate = new Date(startDate);
  endDate.setHours(23, 59, 59, 999); // End of day

  const existingAppointments = await this.constructor.find({
    startTime: {
      $gte: startDate,
      $lte: endDate,
    },
    _id: { $ne: this._id }, // Exclude the current appointment if updating
    status: { $ne: "Cancelled" }, // Ignore cancelled appointments
  });

  const newStart = this.startTime;
  const newEnd = this.endTime;

  const hasConflict = existingAppointments.some((appt) => {
    const apptStart = appt.startTime;
    const apptEnd = appt.endTime;
    return (
      (newStart < apptEnd && newEnd > apptStart) // Overlap check
    );
  });

  if (hasConflict) {
    return next(new Error("This time slot is unavailable due to an existing appointment."));
  }

  next();
});

// Index for common queries
appointmentSchema.index({ startTime: 1, clientId: 1 });

export default mongoose.model("Appointment", appointmentSchema);