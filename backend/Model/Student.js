const mongoose = require("mongoose");

const Student = new mongoose.Schema(
  {
    studentId: {
      type: String,
    },
    name: {
      type: String,
    },
    fingerprint: {
      type: String,
      default: null,
    },
    rfid: {
      type: String,
      default: null,
    },
    faceEmbeddings: {
      type: [[Number]],
      default: [],
    },
  },
  {
    timestamps: true,
  },
);
module.exports = mongoose.model("Student", Student);
