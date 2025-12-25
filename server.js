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
    const data = new HealthData(req.body);
    await data.save();
    res.send({ message: "Saved!", data });
});

// API สำหรับดึงข้อมูลทั้งหมด (GET)
app.get('/api/report', async (req, res) => {
    const allData = await HealthData.find();
    res.send(allData);
});

app.listen(5000, () => console.log("Server on 5000"));