const router = require('express').Router()
const AttdenceController = require('../Controller/Attendance')

router.post('/create', AttdenceController.createAttendance)
router.post('/getAll', AttdenceController.getAttendance)
router.post('/exportByDate', AttdenceController.exportAttendanceByDate)


module.exports = router