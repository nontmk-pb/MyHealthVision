const mongoose = require('mongoose');

const HealthSchema = new mongoose.Schema({
    hn_no: String,
    patientName: String,
    dob: Date,
    gender: String,
    weight: Number,
    height: Number,
    bloodType: String,
    systolic: Number,
    diastolic: Number,
    hba1c: Number,
    ldl: Number,
    cvRisk: Number
}, { 
    timestamps: true,
    strict: false // บังคับให้บันทึกทุก field แม้ Schema จะหาไม่เจอ
});

// ป้องกันการสร้าง Model ซ้ำถ้ามีการ restart server บ่อยๆ
module.exports = mongoose.models.HealthData || mongoose.model('HealthData', HealthSchema);