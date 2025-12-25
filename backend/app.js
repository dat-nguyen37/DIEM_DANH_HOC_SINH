const express = require('express')
require('dotenv').config()
const connect = require('./config/db')
const cors = require('cors')
const app = express()


app.use(express.json())
app.use(cors())

const studentRouter = require('./Route/Student')
const attendenceRouter = require('./Route/Attendence')


app.use('/api/student', studentRouter)
app.use('/api/attendance', attendenceRouter)


app.listen(5000, () => {
    console.log('Server is running on port 5000')
    connect()
})  
