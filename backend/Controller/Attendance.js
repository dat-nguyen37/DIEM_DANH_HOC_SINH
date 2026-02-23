const Attendance = require('../Model/Attendance')
const Student = require('../Model/Student')


const createAttendance = async (req, res) => {
    try {
        const body = req.body
        const student = await Student.findOne({ fingerprint: body.data });

        if (student) {
            const date = new Date();

            const startOfDay = new Date(date.setUTCHours(0, 0, 0, 0));
            const endOfDay = new Date(date.setUTCHours(23, 59, 59, 999));

            const attendance = await Attendance.findOne({
                studentId: student.studentId,
                timestamp: { $gte: startOfDay, $lt: endOfDay },
            });
            if (attendance) {
                res.status(400).json({ message: `Sinh viên ${student.name} đã điểm danh hôm nay!` })
            } else {
                const newAttendance = new Attendance({
                    studentId: student.studentId,
                    timestamp: new Date(),
                    status: true,
                })
                await newAttendance.save()
                res.status(200).json({ message: `Sinh viên ${student.name} đã được điểm danh thành công!` })
            }
        } else {
            res.status(400).json({ message: `Không tìm thấy sinh viên!` })
        }

    } catch (error) {
        res.status(500).json({ message: `Lỗi!` })
    }
}


const getAttendance = async (req, res) => {
    try {
        const date = new Date(req.body.date);

        const startOfDay = new Date(date.setUTCHours(0, 0, 0, 0));
        const endOfDay = new Date(date.setUTCHours(23, 59, 59, 999));

        const students = await Student.find();
        const attendance = await Attendance.find({
            timestamp: { $gte: startOfDay, $lt: endOfDay },
        });
        const attendanceMap = new Map();
        attendance.forEach((record) => {
            attendanceMap.set(record.studentId.toString(), record);
        });

        const result = students.map(student => {
            const record = attendanceMap.get(student.studentId.toString());
            return {
                studentId: student.studentId,
                name: student.name,
                status: !!record, 
                fingerprint: student.fingerprint,
                timestamp: record?.timestamp
            };
        });
        res.status(200).json({
            message: 'success',
            data: result
        })
    } catch (err) {
        res.status(500).json({
            message: 'fail'
        })
    }
}
module.exports = { createAttendance, getAttendance }