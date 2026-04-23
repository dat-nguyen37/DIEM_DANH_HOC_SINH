const mongoose = require("mongoose");

const Student = new mongoose.Schema(
  {
    IDCard: {
      type: String,
    },
    Name: {
      type: String,
    },
    RFID: {
      type: String,
      default: null,
    },
    embeddings: {
      type: [[Number]],
      default: [],
    },
    url: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);
module.exports = mongoose.model("Student", Student);
