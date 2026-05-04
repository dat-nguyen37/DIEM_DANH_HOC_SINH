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
const userRouter = require("./Route/User");
const User = require("./Model/User");

app.use("/api/student", studentRouter);
app.use("/api/attendance", attendenceRouter);
app.use("/api/face", faceRouter);
app.use("/api/user", userRouter);

const seedAdmin = async () => {
  try {
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      await User.create({ username: "admin", password: "admin" });
      console.log("Seed admin success");
    }
  } catch (error) {
    console.log("Seed admin error:", error);
  }
};

app.listen(5000, async () => {
  console.log("Server is running on port 5000");
  await connect();
  await seedAdmin();
});
