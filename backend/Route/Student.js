const router = require('express').Router()
const StudentController = require('../Controller/Student')

router.post('/create', StudentController.createStudent)
router.get('/getAll', StudentController.getAllStudent)
router.delete('/delete/:id', StudentController.DeleteStudent)
router.post('/exportEx', StudentController.exportFile)
router.get('/getOne/:id', StudentController.getStudent)




module.exports = router