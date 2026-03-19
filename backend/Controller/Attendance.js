const Attendance = require("../Model/Attendance");
const Student = require("../Model/Student");

const createAttendance = async (req, res) => {
  try {
    const body = req.body;
    const student = await Student.findOne({ fingerprint: body.data });

    if (student) {
      const date = new Date();

      const startOfDay = new Date(date.setUTCHours(0, 0, 0, 0));
      const endOfDay = new Date(date.setUTCHours(23, 59, 59, 999));

      const attendance = await Attendance.findOne({
        IDCard: student.IDCard,
        timestamp: { $gte: startOfDay, $lt: endOfDay },
      });
      if (attendance) {
        res
          .status(400)
          .json({ message: `Sinh viên ${student.name} đã điểm danh hôm nay!` });
      } else {
        const newAttendance = new Attendance({
          IDCard: student.IDCard,
          timestamp: new Date(),
          status: true,
        });
        await newAttendance.save();
        res.status(200).json({
          message: `Sinh viên ${student.name} đã được điểm danh thành công!`,
        });
      }
    } else {
      res.status(400).json({ message: `Không tìm thấy sinh viên!` });
    }
  } catch (error) {
    res.status(500).json({ message: `Lỗi!` });
  }
};

const getAttendance = async (req, res) => {
  try {
    const inputDate = new Date(req.body.date);

    const startOfDay = new Date(inputDate);
    startOfDay.setUTCHours(0, 0, 0, 0);
    const endOfDay = new Date(inputDate);
    endOfDay.setUTCHours(23, 59, 59, 999);

    const students = await Student.find();
    const attendance = await Attendance.find({
      timestamps: { $gte: startOfDay, $lt: endOfDay },
    });

    // Map lưu thông tin: số lượng, min, max
    const attendanceMap = new Map();
    attendance.forEach((record) => {
      const id = record.IDCard.toString();
      if (!attendanceMap.has(id)) {
        attendanceMap.set(id, {
          count: 1,
          min: record.timestamps,
          max: record.timestamps,
        });
      } else {
        const data = attendanceMap.get(id);
        data.count++;
        if (record.timestamps < data.min) data.min = record.timestamps;
        if (record.timestamps > data.max) data.max = record.timestamps;
      }
    });

    const result = students.map((student) => {
      const id = student.IDCard.toString();
      const data = attendanceMap.get(id);

      let timeIn = null;
      let timeOut = null;
      let status = false;

      if (data) {
        status = true;
        timeIn = data.min;
        // Chỉ có timeOut nếu có ít nhất 2 bản ghi
        if (data.count > 1) {
          timeOut = data.max;
        }
      }

      return {
        IDCard: student.IDCard,
        name: student.Name,
        status,
        timeIn,
        timeOut,
      };
    });

    res.status(200).json({
      message: "success",
      data: result,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "fail",
    });
  }
};
module.exports = { createAttendance, getAttendance };
