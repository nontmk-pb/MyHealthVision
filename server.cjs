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

// [POST] User Data
app.post('/api/user', async (req, res) => {
  console.log("📥 Incoming user Data:", req.body);
  try {
    const data = new UserData(req.body);
    const savedData = await data.save();
    res.status(201).json({ message: "Saved!", data: savedData });
  } catch (err) {
    res.status(400).json({ message: "Error saving data", error: err.message });
  }
});

// [POST] Report
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

// [GET] Report all
app.get('/api/report', async (req, res) => {
  try {
    const allData = await HealthData.find().sort({ createdAt: -1 }); // เรียงล่าสุดขึ้นก่อน
    res.json(allData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// [GET] User data
app.get('/api/user', async (req, res) => {
  try {
    const allData = await UserData.find().sort({ createdAt: -1 }); // เรียงล่าสุดขึ้นก่อน
    res.json(allData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// [PUT] Report
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

// [PUT] User data
app.put('/api/user/:id', async (req, res) => {
  try {
    const updated = await UserData.findByIdAndUpdate(
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

// [DELETE] Report
app.delete('/api/report/:id', async (req, res) => {
  try {
    const deleted = await HealthData.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Not found' });
    res.json({ message: 'Deleted!', data: deleted });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// [DELETE] User data
app.delete('/api/user/:id', async (req, res) => {
  try {
    const deleted = await UserData.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Not found' });
    res.json({ message: 'Deleted!', data: deleted });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// เริ่มต้นรัน Server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));