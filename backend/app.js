const express = require("express");
require("dotenv").config();
const connect = require("./config/db");
const cors = require("cors");
const app = express();

app.use(express.json());
app.use(cors());
app.use("/uploads", express.static("uploads"));

const studentRouter = require("./Route/Student");
const attendenceRouter = require("./Route/Attendence");
const faceRouter = require("./Route/Face");

app.use("/api/student", studentRouter);
app.use("/api/attendance", attendenceRouter);
app.use("/api/face", faceRouter);

app.listen(5000, () => {
  console.log("Server is running on port 5000");
  connect();
});
