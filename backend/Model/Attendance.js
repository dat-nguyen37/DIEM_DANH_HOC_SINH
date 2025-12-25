const mongoose=require('mongoose')

const Attendance=new mongoose.Schema({
    studentId:{
        type:String,
    },
    timestamp:{
        type:Date,
        default: Date.now
    },
    status:{
        type:Boolean,
    }
},{
    timestamps:true
})
module.exports=mongoose.model('Attendance',Attendance)