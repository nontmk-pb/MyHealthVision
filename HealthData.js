const mongoose = require('mongoose');
const HealthSchema = new mongoose.Schema({
    patientName: String,
    bloodSugar: Number, // ค่าระดับน้ำตาล
    sys: Number,        // ความดันตัวบน
    dia: Number,        // ความดันตัวล่าง
    bmi: Number,        // ดัชนีมวลกาย
    diseaseRisk: String // ผลวิเคราะห์ว่าเสี่ยงโรคอะไร
});
module.exports = mongoose.model('HealthData', HealthSchema);
//โอเค