const mongoose = require('mongoose');

const PatientSchema = new mongoose.Schema({
    hn_no: { type: String, required: true, unique: true }, // สำคัญ! ต้องไม่ซ้ำ
    patientName: String,
    dob: Date,
    gender: String,
    bloodType: String,
    company: String,
    unit: String,
    department: String
}, { 
    timestamps: true,
    strict: false // บังคับให้บันทึกทุก field แม้ Schema จะหาไม่เจอ
});

module.exports = mongoose.models.Patient || mongoose.model('PatientData', PatientSchema);