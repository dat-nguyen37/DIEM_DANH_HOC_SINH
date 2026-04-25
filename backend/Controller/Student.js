const Attendance = require("../Model/Attendance");
const Student = require("../Model/Student");
const ExcelJS = require("exceljs");
const fs = require("fs");
const path = require("path");

const createStudent = async (req, res) => {
  try {
    const body = req.body;
    let imageUrl = null;

    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    }

    const newStudent = new Student({
      IDCard: body.IDCard,
      Name: body.Name,
      RFID: body.RFID,
      embeddings: body.embeddings ? JSON.parse(body.embeddings) : [],
      url: imageUrl,
    });
    await newStudent.save();
    res.status(200).json({
      message: "success",
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "fail",
    });
  }
};
const getAllStudent = async (req, res) => {
  try {
    const { month, year } = req.query;

    const startOfMonth = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0));
    const endOfMonth = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));
    const students = await Student.find();

    const attendanceRecords = await Attendance.find({
      timestamps: { $gte: startOfMonth, $lte: endOfMonth },
    });

    // Map lưu Set các ngày (YYYY-MM-DD) cho mỗi IDCard
    const attendanceMap = new Map();
    attendanceRecords.forEach((a) => {
      const id = a.IDCard.toString();
      if (!attendanceMap.has(id)) {
        attendanceMap.set(id, new Set());
      }
      const dateStr = a.timestamps.toISOString().split("T")[0]; // lấy phần ngày
      attendanceMap.get(id).add(dateStr);
    });

    const result = students.map((s) => ({
      id: s._id,
      IDCard: s.IDCard,
      RFID: s.RFID,
      Name: s.Name,
      url: s.url,
      attendedDays: attendanceMap.get(s.IDCard?.toString())?.size || 0, // số ngày có điểm danh
      embeddings: s.embeddings,
    }));

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
const getStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const student = await Student.findOne({ fingerprint: id.toString() });
    res.status(200).json(student);
  } catch (err) {
    res.status(500).json({ message: "error" });
  }
};
const DeleteStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    if (student.url) {
      const filePath = path.join(__dirname, "..", student.url);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await Student.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Delete student success" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "error" });
  }
};
const exportFile = async (req, res) => {
  const data = req.body.data;
  const month = req.body.month;
  const year = req.body.year;

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(
    `Danh sách điểm danh tháng ${month} năm ${year}`,
  );

  // Tiêu đề bảng
  worksheet.mergeCells("A1:D1");
  const header = worksheet.getCell("A1");
  header.value = `Danh sách điểm danh tháng ${month} năm ${year}`;
  header.font = { bold: true, size: 14 };
  header.alignment = { horizontal: "center" };

  // Thời gian tạo
  worksheet.getCell("A2").value =
    `Thời gian tạo: ${new Date().toLocaleString()}`;
  worksheet.getCell("A2").font = { italic: true };

  // Tiêu đề cột
  worksheet.getCell("A3").value = "ID";
  worksheet.getCell("B3").value = "Tên sinh viên";
  worksheet.getCell("C3").value = "RFID";
  worksheet.getCell("D3").value = "Số ngày điểm danh";
  worksheet.getRow(3).font = { bold: true };

  data.forEach((order, index) => {
    const rowIndex = index + 4; // Bắt đầu từ dòng thứ 4
    worksheet.getCell(`A${rowIndex}`).value = order["ID"];
    worksheet.getCell(`B${rowIndex}`).value = order["Tên sinh viên"];
    worksheet.getCell(`C${rowIndex}`).value = order["RFID"];
    worksheet.getCell(`D${rowIndex}`).value = order["Số ngày điểm danh"];
  });

  worksheet.columns.forEach((column) => {
    column.width = 25;
  });

  // Xuất file
  const buffer = await workbook.xlsx.writeBuffer();

  // Thiết lập header để tải file về
  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  );
  res.setHeader(
    "Content-Disposition",
    "attachment; filename*=UTF-8''" +
      encodeURIComponent(`Danh sách điểm danh tháng ${month} năm ${year}.xlsx`),
  ); // Gửi buffer về client
  res.send(buffer);
  // console.log(`Tệp Excel đã được tạo tại: ${filePath}`);
};

module.exports = {
  createStudent,
  getAllStudent,
  exportFile,
  DeleteStudent,
  getStudent,
};
