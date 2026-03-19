const mongoose = require("mongoose");

const Attendance = new mongoose.Schema(
  {
    IDCard: {
      type: String,
    },
    timestamps: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);
module.exports = mongoose.model("Attendance", Attendance);
