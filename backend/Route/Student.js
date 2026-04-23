const router = require('express').Router()
const StudentController = require('../Controller/Student')
const multer = require('multer')
const path = require('path')

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname))
  }
})

const upload = multer({ storage: storage })

router.post('/create', upload.single('image'), StudentController.createStudent)
router.get('/getAll', StudentController.getAllStudent)
router.delete('/delete/:id', StudentController.DeleteStudent)
router.post('/exportEx', StudentController.exportFile)
router.get('/getOne/:id', StudentController.getStudent)




module.exports = router