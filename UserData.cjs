const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
}, { 
    timestamps: true,
    strict: false // บังคับให้บันทึกทุก field แม้ Schema จะหาไม่เจอ
});

// ป้องกันการสร้าง Model ซ้ำถ้ามีการ restart server บ่อยๆ
module.exports = mongoose.models.UserData || mongoose.model('UserData', UserSchema);