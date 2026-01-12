const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const HealthData = require('./HealthData');

const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect(process.env.MONGO_URI).then(() => console.log("DB Connected"));

// API สำหรับบันทึกข้อมูล (POST)
app.post('/api/report', async (req, res) => {
    console.log("--- ข้อมูลที่ส่งมาจาก Postman ---");
    console.log(req.body); // เพิ่มบรรทัดนี้เพื่อดู log ในจอดำ (Terminal)
    console.log("------------------------------");

    try {
        const data = new HealthData(req.body);
        const savedData = await data.save();
        res.status(201).json({ 
            message: "Saved!", 
            data: savedData 
        });
    } catch (err) {
        // ถ้าข้อมูลไม่ครบ หรือประเภทข้อมูลผิด มันจะฟ้องที่นี่
        res.status(400).json({ 
            message: "Error saving data", 
            error: err.message 
        });
    }
});

// API สำหรับดึงข้อมูลทั้งหมด (GET)
app.get('/api/report', async (req, res) => {
    const allData = await HealthData.find();
    res.send(allData);
});

app.put('/api/report/:id', async (req, res) => {
  try {
    const updated = await HealthData.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: 'Not found' });

    res.json({
      message: 'Updated!',
      data: updated
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/report/:id', async (req, res) => {
  try {
    const deleted = await HealthData.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Not found' });

    res.json({
      message: 'Deleted!',
      data: deleted
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(5001, () => console.log("Server on 5000"));