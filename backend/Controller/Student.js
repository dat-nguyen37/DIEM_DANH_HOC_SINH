const Attendance = require('../Model/Attendance')
const Student = require('../Model/Student')
const ExcelJS = require('exceljs');

const createStudent = async (req, res) => {
    try {
        const body = req.body
        const newStudent = new Student({
            studentId: body.studentId,
            name: body.name,
            fingerprint: body.fingerprint
        })
        await newStudent.save()
        res.status(200).json({
            message: 'success'
        })
    } catch (err) {
        res.status(500).json({
            message: 'fail'
        })
    }
}
const getAllStudent = async (req, res) => {
    try {
        const { month, year } = req.query;

        const startOfMonth = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0));
        const endOfMonth = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));
        const students = await Student.find();

        const attendanceRecords = await Attendance.find({
            timestamp: { $gte: startOfMonth, $lte: endOfMonth }
        });

        const attendanceMap = new Map();
        attendanceRecords.forEach(a => {
            attendanceMap.set(a.studentId.toString(), (attendanceMap.get(a.studentId.toString()) || 0) + 1);
        });

        const result = students.map(s => ({
            id: s._id,
            studentId: s.studentId,
            name: s.name,
            absent: attendanceMap.get(s.studentId.toString()) || 0,
            fingerprint: s.fingerprint,
        }));

        res.status(200).json({
            message: 'success',
            data: result
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: 'fail'
        });
    }
};
const getStudent = async (req, res) => {
    try {
        const { id } = req.params
        const student = await Student.findOne({ fingerprint: id.toString() })
        res.status(200).json(student)
    } catch (err) {
        res.status(500).json({ message: "error" })
    }
}
const DeleteStudent = async (req, res) => {
    try {
        await Student.findOneAndDelete({ fingerprint: req.params.id.toString() })
        res.status(200).json({ message: "Delete student success" })
    } catch (err) {
        res.status(500).json({ message: "error" })
    }
}
const exportFile = async (req, res) => {
    const data = req.body.data
    const month = req.body.month
    const year = req.body.year

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(`Danh sách điểm danh tháng ${month} năm ${year}`);

    // Tiêu đề bảng
    worksheet.mergeCells('A1:B1:C1');
    const header = worksheet.getCell('A1');
    header.value = `Danh sách điểm danh tháng ${month} năm ${year}`;
    header.font = { bold: true, size: 14 };
    header.alignment = { horizontal: 'center' };

    // Thời gian tạo
    worksheet.getCell('A2').value = `Thời gian tạo: ${new Date().toLocaleString()}`;
    worksheet.getCell('A2').font = { italic: true };

    // Tiêu đề cột
    worksheet.getCell('A3').value = 'ID';
    worksheet.getCell('B3').value = 'Tên sinh viên';
    worksheet.getCell('C3').value = 'Đi học';
    worksheet.getRow(3).font = { bold: true };

    data.forEach((order, index) => {
        const rowIndex = index + 4; // Bắt đầu từ dòng thứ 4
        worksheet.getCell(`A${rowIndex}`).value = order['ID'];
        worksheet.getCell(`B${rowIndex}`).value = order['Tên sinh viên'];
        worksheet.getCell(`C${rowIndex}`).value = order['Đi học'];
    });

    worksheet.columns.forEach((column) => {
        column.width = 25;
    });

    // Xuất file
    const buffer = await workbook.xlsx.writeBuffer();

    // Thiết lập header để tải file về
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader(
        'Content-Disposition',
        "attachment; filename*=UTF-8''" + encodeURIComponent(`Danh sách điểm danh tháng ${month} năm ${year}.xlsx`)
    );    // Gửi buffer về client
    res.send(buffer);
    // console.log(`Tệp Excel đã được tạo tại: ${filePath}`);
};

module.exports = { createStudent, getAllStudent, exportFile, DeleteStudent, getStudent }