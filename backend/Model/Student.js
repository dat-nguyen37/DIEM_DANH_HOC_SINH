const mongoose = require("mongoose");

const Student = new mongoose.Schema(
  {
    IDCard: {
      type: String,
    },
    Name: {
      type: String,
    },
    rfid: {
      type: String,
      default: null,
    },
    embeddings: {
      type: [[Number]],
      default: [],
    },
  },
  {
    timestamps: true,
  },
);
module.exports = mongoose.model("Student", Student);
