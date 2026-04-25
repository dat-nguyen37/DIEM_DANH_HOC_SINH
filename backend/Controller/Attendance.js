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
        Name: student.Name,
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
const ExcelJS = require("exceljs");

const exportAttendanceByDate = async (req, res) => {
  try {
    const inputDate = new Date(req.body.date);
    const dateLabel = inputDate.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      timeZone: "Asia/Ho_Chi_Minh",
    });

    // Lấy khoảng ngày theo UTC+7
    const startOfDay = new Date(inputDate);
    startOfDay.setUTCHours(0, 0, 0, 0);
    const endOfDay = new Date(inputDate);
    endOfDay.setUTCHours(23, 59, 59, 999);

    const students = await Student.find();
    const attendance = await Attendance.find({
      timestamps: { $gte: startOfDay, $lte: endOfDay },
    });

    // Gộp timeIn / timeOut theo IDCard
    const attendanceMap = new Map();
    attendance.forEach((record) => {
      const id = record.IDCard.toString();
      if (!attendanceMap.has(id)) {
        attendanceMap.set(id, { min: record.timestamps, max: record.timestamps, count: 1 });
      } else {
        const d = attendanceMap.get(id);
        d.count++;
        if (record.timestamps < d.min) d.min = record.timestamps;
        if (record.timestamps > d.max) d.max = record.timestamps;
      }
    });

    const toVN = (date) =>
      date
        ? new Date(date).toLocaleTimeString("vi-VN", {
            hour: "2-digit",
            minute: "2-digit",
            timeZone: "Asia/Ho_Chi_Minh",
          })
        : "--";

    // Tạo workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(`Diem danh ${dateLabel.replace(/\//g, "-")}`);

    // Tiêu đề bảng
    worksheet.mergeCells("A1:E1");
    const header = worksheet.getCell("A1");
    header.value = `Bảng điểm danh ngày ${dateLabel}`;
    header.font = { bold: true, size: 14 };
    header.alignment = { horizontal: "center" };

    worksheet.getCell("A2").value = `Thời gian xuất: ${new Date().toLocaleString("vi-VN")}`;
    worksheet.getCell("A2").font = { italic: true };

    // Header cột
    const colHeaders = ["STT", "ID Sinh viên", "Tên sinh viên","RFID", "Giờ vào", "Giờ ra"];
    colHeaders.forEach((text, i) => {
      const cell = worksheet.getCell(3, i + 1);
      cell.value = text;
      cell.font = { bold: true };
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFD9EAD3" } };
      cell.border = {
        top: { style: "thin" }, bottom: { style: "thin" },
        left: { style: "thin" }, right: { style: "thin" },
      };
    });

    // Dữ liệu
    students.forEach((student, index) => {
      const d = attendanceMap.get(student.IDCard.toString());
      const timeIn  = d ? toVN(d.min) : "--";
      const timeOut = d && d.count > 1 ? toVN(d.max) : "--";
      const row = [index + 1, student.IDCard, student.Name,student.RFID , timeIn, timeOut];
      const rowIndex = index + 4;
      row.forEach((val, col) => {
        const cell = worksheet.getCell(rowIndex, col + 1);
        cell.value = val;
        cell.border = {
          top: { style: "thin" }, bottom: { style: "thin" },
          left: { style: "thin" }, right: { style: "thin" },
        };
        if (!d) cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFFF2CC" } };
      });
    });

    worksheet.columns = [
      { width: 6 }, { width: 14 }, { width: 22 }, { width: 12 }, { width: 12 }, { width: 12 },
    ];

    const buffer = await workbook.xlsx.writeBuffer();
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename*=UTF-8''" + encodeURIComponent(`Diem_danh_${dateLabel.replace(/\//g, "-")}.xlsx`)
    );
    res.send(buffer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "fail" });
  }
};

module.exports = { createAttendance, getAttendance, exportAttendanceByDate };
