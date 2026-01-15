const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// นำเข้า Models (ตรวจสอบชื่อไฟล์ให้ตรง .cjs)
const HealthData = require('./HealthData.cjs');
const UserData = require('./UserData.cjs');

const app = express();
app.use(express.json());
app.use(cors());

// เชื่อมต่อ Database
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ DB Connected Successfully"))
  .catch(err => console.error("❌ DB Connection Error:", err));

// ตัวอย่าง Model User (ถ้าจะแยกไฟล์ให้ทำเหมือน HealthData.cjs)

// --- API ROUTES ---

// [POST] Register User (สมัครสมาชิก)
app.post('/api/user', async (req, res) => {
  console.log("📥 Register Request:", req.body);
  try {
    const { username, email, password } = req.body;
    
    // เช็คว่ามี username หรือ email นี้หรือยัง
    const existingUser = await UserData.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: "Username or Email already exists" });
    }

    const data = new UserData({ username, email, password });
    const savedData = await data.save();
    res.status(201).json({ message: "Register Success!", data: savedData });
  } catch (err) {
    res.status(400).json({ message: "Error registering", error: err.message });
  }
});

// [POST] Login (เข้าสู่ระบบ - เพิ่มส่วนนี้ใหม่)
app.post('/api/login', async (req, res) => {
  console.log("📥 Login Request:", req.body);
  try {
    const { username, password } = req.body;

    // ค้นหา User ในฐานข้อมูล
    const user = await UserData.findOne({ username });

    // เช็คว่าเจอ User ไหม และ Password ตรงไหม
    if (!user || user.password !== password) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    // ถ้าตรงกัน ส่ง success กลับไป
    res.json({ message: "Login Success!", user: { id: user._id, username: user.username } });

  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
});

// [POST] Report (ข้อมูลผู้ป่วย)
app.post('/api/report', async (req, res) => {
  console.log("📥 Incoming Data:", req.body);
  try {
    const data = new HealthData(req.body);
    const savedData = await data.save();
    res.status(201).json({ message: "Saved!", data: savedData });
  } catch (err) {
    res.status(400).json({ message: "Error saving data", error: err.message });
  }
});

// [GET] Report all (ข้อมูลผู้ป่วย)
app.get('/api/report', async (req, res) => {
  try {
    const allData = await HealthData.find().sort({ createdAt: -1 }); // เรียงล่าสุดขึ้นก่อน
    res.json(allData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// [PUT] Report (ข้อมูลผู้ป่วย)
app.put('/api/report/:id', async (req, res) => {
  try {
    const updated = await HealthData.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true } // runValidators ช่วยเช็กความถูกต้องข้อมูลตอนอัปเดต
    );
    if (!updated) return res.status(404).json({ message: 'Not found' });
    res.json({ message: 'Updated!', data: updated });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// [DELETE] Report (ข้อมูลผู้ป่วย)
app.delete('/api/report/:id', async (req, res) => {
  try {
    const deleted = await HealthData.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Not found' });
    res.json({ message: 'Deleted!', data: deleted });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// เริ่มต้นรัน Server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));