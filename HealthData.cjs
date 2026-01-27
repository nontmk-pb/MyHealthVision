const mongoose = require('mongoose');

const HealthSchema = new mongoose.Schema({
    patient_id: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'PatientData', // เชื่อมไปหา Model Patient
        required: true 
    },
    visitDate: Date,
    weight: Number,
    height: Number,
    systolic: Number,
    diastolic: Number,
    hba1c: Number,
    cholesterol:Number,
    ldl: Number,
    cvRisk: Number
}, { 
    timestamps: true,
    strict: false // บังคับให้บันทึกทุก field แม้ Schema จะหาไม่เจอ
});

//visitDate: { type: Date, default: Date.now }

module.exports = mongoose.models.HealthRecord || mongoose.model('HealthData', HealthSchema);