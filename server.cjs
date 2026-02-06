const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// นำเข้า Models (ตรวจสอบชื่อไฟล์ให้ตรง .cjs)
const HealthData = require('./HealthData.cjs');
const UserData = require('./UserData.cjs');
const PatientData = require('./PatientData.cjs');

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

// --- API ROUTES ---

// [POST] Add Health Data (ระบบอัจฉริยะ: เช็คคนเก่า/สร้างคนใหม่ อัตโนมัติ)
app.post('/api/report', async (req, res) => {
  console.log("📥 Incoming Health Data:", req.body);
  
  // แยกข้อมูลจาก req.body
  const { 
    hn_no, patientName, dob, gender, bloodType, company, unit, department,                 // ข้อมูลคน
    visitDate, weight, height, systolic, diastolic, hba1c, cholesterol, ldl, smoking, temperature, spo2, hb, hct, plt, wbc, neutrophil, fbs, tg, hdl     // ข้อมูลผลตรวจ
  } = req.body;

  try {
    let targetPatientId;

    // 1. ค้นหาว่ามีผู้ป่วยคนนี้ (HN) ในระบบหรือยัง?
    let patient = await PatientData.findOne({ hn_no: hn_no });

    if (patient) {
      // --- กรณีเจอ: เป็นผู้ป่วยเก่า ---
      console.log(`✅ Found existing patient: ${patient.patientName}`);
      targetPatientId = patient._id; // ใช้ ID เดิม

      // (Optional) ถ้าอยากอัปเดตชื่อหรือข้อมูลส่วนตัวด้วย ให้ทำตรงนี้
      // await Patient.findByIdAndUpdate(patient._id, { patientName, height });
      
    } else {
      // --- กรณีไม่เจอ: เป็นผู้ป่วยใหม่ ---
      console.log(`🆕 Creating new patient: ${patientName}`);
      const newPatient = new PatientData({
        hn_no, patientName, dob, gender, bloodType, company, unit, department
      });
      const savedPatient = await newPatient.save();
      targetPatientId = savedPatient._id; // ได้ ID ใหม่มาใช้
    }

    // 2. บันทึก "ผลตรวจ" ลงใน HealthRecord (เชื่อมด้วย ID)
    const newRecord = new HealthData({
      patient_id: targetPatientId, // *หัวใจสำคัญของการเชื่อมโยง*
      weight, height, systolic, diastolic, hba1c, cholesterol, ldl, smoking, temperature, spo2, hb, hct, plt, wbc, neutrophil, fbs, tg, hdl,
      visitDate: visitDate ? new Date(visitDate) : new Date()
    });

    const savedRecord = await newRecord.save();

    res.status(201).json({ 
      message: "Saved Successfully!", 
      patientStatus: patient ? "Existing" : "New",
      record: savedRecord 
    });

  } catch (err) {
    console.error("❌ Save Error:", err);
    res.status(400).json({ message: "Error saving data", error: err.message });
  }
});

// [GET] ดึงประวัติการตรวจทั้งหมดของผู้ป่วยคนหนึ่ง (ตาม HN)
app.get('/api/history/:hn', async (req, res) => {
    try {
        // 1. หาตัวคนก่อน
        const patient = await PatientData.findOne({ hn_no: req.params.hn });
        if (!patient) return res.status(404).json({ message: "Patient not found" });

        // 2. หาประวัติทั้งหมดของคนนี้
        const history = await HealthData.find({ patient_id: patient._id })
                                          .sort({ visitDate: -1 }); // ล่าสุดขึ้นก่อน

        res.json({
            patientInfo: patient,
            checkupHistory: history
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// [GET] UserData (ข้อมูล Username, Eamil, Password)
app.get('/api/user', async (req, res) => {
  try {
    const allData = await UserData.find().sort({ createdAt: -1 }); // เรียงล่าสุดขึ้นก่อน
    res.json(allData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// [GET] Report all (ผลตรวจผู้ป่วย)
app.get('/api/report', async (req, res) => {
  try {
    const allData = await HealthData.find().sort({ createdAt: -1 }); // เรียงล่าสุดขึ้นก่อน
    res.json(allData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// [GET] Report ID (ผลตรวจผู้ป่วย)
app.get('/api/report/:id', async (req, res) => {
  try {
    const data = await HealthData.findById(req.params.id);

    if (!data) {
      return res.status(404).json({ message: 'Not found' });
    }

    res.json(data);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


// [GET] List All Patients (ดึงรายชื่อผู้ป่วยทั้งหมด สำหรับแสดงในตาราง)
app.get('/api/patients', async (req, res) => {
  try {
    const patients = await PatientData.find().sort({ updatedAt: -1 }); // เรียงตามอัปเดตล่าสุด
    res.json(patients);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// [PUT] UserData (ข้อมูล Username, Eamil, Password)
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

// [PUT] Report (ข้อมูลผู้ป่วย)
app.put('/api/patients/:id', async (req, res) => {
  try {
    const updated = await PatientData.findByIdAndUpdate(
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

// [DELETE] UserData (ข้อมูล Username, Eamil, Password)
app.delete('/api/user/:id', async (req, res) => {
  try {
    const deleted = await UserData.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Not found' });
    res.json({ message: 'Deleted!', data: deleted });
  } catch (err) {
    res.status(500).json({ error: err.message });
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