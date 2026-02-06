import React, { useState, useEffect, useRef } from 'react';
import { Home, User, Activity, LogOut } from 'lucide-react'; 
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList } from 'recharts';
import axios from 'axios'; 

import hypertensionPic from './assets/hypertension_pic.png';
import diabetesPic from './assets/diabetes_pic.png';
import cvdPic from './assets/cvd_pic.png';
import obesityPic from './assets/obesity_pic.png';
import cholesterolPic from './assets/cholesterol_pic.png';

const NcdsPage = () => {
  const navigate = useNavigate();
  const themeColor = '#1f0177'; 
  const contentColor = '#ffffff'; 

  const [chartData, setChartData] = useState([]);
  const [totalPatients, setTotalPatients] = useState(0);

  const lastUpdateRef = useRef({ dataString: "", totalCount: -1 });

  // ฟังก์ชันคำนวณ Thai ASCVD Score 2
  const calculateASCVD = (p, record) => {
    if (!p || !record) return 0;
      const age = Math.abs(new Date(Date.now() - new Date(p.dob).getTime()).getUTCFullYear() - 1970);
      const sex = (p.gender === 'ชาย' || p.gender === 'Male') ? 1 : 0;
      const smoking = (p.is_smoking || p.smoking === 'Yes') ? 1 : 0;
      const dm = record.hba1c >= 6.5 ? 1 : 0;
      const sbp = parseFloat(record.systolic) || 120;
      const chol = parseFloat(record.cholesterol) || 200;

      const fullScore = (0.08183 * age) + (0.39499 * sex) + (0.02084 * sbp) + (0.69974 * dm) + (0.00212 * chol) + (0.41916 * smoking);
    return (1 - Math.pow(0.978296, Math.exp(fullScore - 7.04423))) * 100;
  };

  const fetchHealthData = async () => {
    try {
      const [reportsRes, patientsRes] = await Promise.all([
        axios.get('http://localhost:5001/api/report'),
        axios.get('http://localhost:5001/api/patients')
      ]);

      const allRecords = reportsRes.data;
      const allPatients = patientsRes.data;

      const uniquePatientsMap = new Map();
      allRecords.forEach(record => {
        if (record.patient_id && !uniquePatientsMap.has(record.patient_id)) {
            uniquePatientsMap.set(record.patient_id, record);
        }
      });

      const latestRecords = Array.from(uniquePatientsMap.values());
      setTotalPatients(latestRecords.length);

      let countHT = 0, countDM = 0, countCVD = 0, countObesity = 0, countHyper = 0;

      latestRecords.forEach(record => {
        const patientInfo = allPatients.find(p => p._id === record.patient_id) || {};
        
        const sys = parseFloat(record.systolic) || 0;
        const dia = parseFloat(record.diastolic) || 0;
        const hba1c = parseFloat(record.hba1c) || 0;
        const chol = parseFloat(record.cholesterol) || 0;
        const weight = parseFloat(record.weight) || 0;
        const height = parseFloat(record.height) || 0;

        // เตรียมตัวแปรสำหรับ ASCVD
        const age = patientInfo.age || 0;
        const sex = (patientInfo.gender === 'ชาย' || patientInfo.gender === 'Male') ? 1 : 0;
        const dmStatus = hba1c >= 6.5 ? 1 : 0;
        const smokingStatus = patientInfo.is_smoking ? 1 : 0; 

        const ascvdScore = calculateASCVD({ age, sex, sbp: sys, dm: dmStatus, chol, smoking: smokingStatus });

        // ตรวจสอบเงื่อนไข NCDs
        if (sys >= 140 || dia >= 90) countHT++;
        if (hba1c >= 6.5) countDM++;
        if (ascvdScore >= 20) countCVD++; // ปรับเงื่อนไขการนับ CVD ให้เป็น 20% (ความเสี่ยงสูง)
        if (height > 0 && (weight / ((height/100)**2)) >= 25) countObesity++;
        if (chol >= 240) countHyper++;
      });

      const newData = [
        { name: 'โรคความดันโลหิตสูง', count: countHT },
        { name: 'โรคเบาหวาน', count: countDM },
        { name: 'โรคหัวใจและหลอดเลือด', count: countCVD },
        { name: 'โรคอ้วน', count: countObesity },
        { name: 'โรคไขมันในเลือดสูง', count: countHyper },
      ];

      if (lastUpdateRef.current.dataString !== JSON.stringify(newData)) {
          setChartData(newData);
          lastUpdateRef.current.dataString = JSON.stringify(newData);
      } 
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchHealthData();
    const intervalId = setInterval(fetchHealthData, 5000);
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div style={{ backgroundColor: themeColor, height: '100vh', width: '100vw', display: 'flex', overflow: 'hidden', fontFamily: "'Prompt', sans-serif" }}>
      <div style={{ width: '85px', flexShrink: 0, position: 'relative', display: 'flex', flexDirection: 'column', zIndex: 20 }}>
        <div style={{ position: 'absolute', top: '40%', left: 0, width: '100%', transform: 'translateY(-50%)', display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <SidebarItem icon={<Home size={26} />} isActive={true} onClick={() => {}} themeColor={themeColor} />
          <SidebarItem icon={<User size={26} />} onClick={() => navigate('/patientlist')} themeColor={themeColor} />
          <SidebarItem icon={<Activity size={26} />} onClick={() => navigate('/risklist')} themeColor={themeColor} />
        </div>
        <div style={{ position: 'absolute', bottom: '30px', width: '100%' }}>
           <SidebarItem icon={<LogOut size={26} />} onClick={() => navigate('/')} themeColor={themeColor} />
        </div>
      </div>

      <div style={{ flex: 1, position: 'relative', display: 'flex', flexDirection: 'column', padding: '20px 20px 20px 0' }}>
        <div style={{ backgroundColor: '#f5f7fa', width: '100%', height: '100%', borderRadius: '40px', padding: '30px', display: 'flex', flexDirection: 'column', overflow: 'auto' }}>
          <div style={{ minWidth: '900px', display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{ marginBottom: '15px' }}><h2 style={{ color: 'black', margin: 0, fontSize: '22px' }}>ความเสี่ยงสุขภาพทั้งระบบ</h2></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', flex: 1 }}>
              <div style={{ backgroundColor: '#fff', borderRadius: '20px', padding: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', flex: 1, minHeight: '350px', display: 'flex', flexDirection: 'column' }}>
                  <p style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '15px', color: '#555' }}>ผู้ป่วยทั้งหมด {totalPatients.toLocaleString()} คน</p>
                  <div style={{ flex: 1, width: '100%' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                        <XAxis dataKey="name" tick={{ fontSize: 14 }} axisLine={false} tickLine={false} interval={0} />
                        <YAxis axisLine={false} tickLine={false} />
                        <Tooltip cursor={{ fill: 'transparent' }} />
                        <Bar dataKey="count" fill={themeColor} radius={[6, 6, 0, 0]} barSize={60}>
                          <LabelList dataKey="count" position="top" fill="#444" fontSize={16}  formatter={(val) => `${val} คน`} />
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
              </div>
              <div>
                 <h3 style={{ color: '#333', marginBottom: '15px', fontSize: '20px' }}>กลุ่มความเสี่ยงเฉพาะโรค</h3>
                 <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' }}>
                    <RiskCard title="โรคความดันโลหิตสูง" subtitle="(Hypertension)" icon={<img src={hypertensionPic} style={{ width: '100%' }} />} color="#e7f5ff" onClick={() => navigate('/risklist', { state: { disease: 'โรคความดันโลหิตสูง' } })} />
                    <RiskCard title="โรคเบาหวาน" subtitle="(Diabetes)" icon={<img src={diabetesPic} style={{ width: '100%' }} />} color="#fff5f5" onClick={() => navigate('/risklist', { state: { disease: 'โรคเบาหวาน' } })} />
                    <RiskCard title="โรคหัวใจและหลอดเลือด" subtitle="(CVD)" icon={<img src={cvdPic} style={{ width: '100%' }} />} color="#ffe3e3" onClick={() => navigate('/risklist', { state: { disease: 'โรคหัวใจและหลอดเลือด' } })} />
                    <RiskCard title="โรคอ้วน" subtitle="(Obesity)" icon={<img src={obesityPic} style={{ width: '100%' }} />} color="#fff9db" onClick={() => navigate('/risklist', { state: { disease: 'โรคอ้วน' } })} />
                    <RiskCard title="โรคไขมันในเลือดสูง" subtitle="(High cholesterol)" icon={<img src={cholesterolPic} style={{ width: '100%' }} />} color="#ebfbee" onClick={() => navigate('/risklist', { state: { disease: 'โรคไขมันในเลือดสูง' } })} />
                 </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const RiskCard = ({ title, subtitle, icon, color, onClick }) => (
  <div onClick={onClick} style={{ backgroundColor: '#fff', borderRadius: '16px', padding: '15px 20px', display: 'flex', alignItems: 'center', gap: '15px', boxShadow: '0 4px 12px rgba(0,0,0,0.06)', cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
    <div style={{ width: '70px', height: '70px', borderRadius: '50%', backgroundColor: color, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '5px' }}>{icon}</div>
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <span style={{ fontSize: '12.5px', fontWeight: '500', color: '#333' }}>{title}</span>
      <span style={{ fontSize: '13px', color: '#777', fontWeight: '300' }}>{subtitle}</span>
    </div>
  </div>
);

const SidebarItem = ({ icon, isActive, onClick, themeColor }) => (
    <div onClick={onClick} style={{ height: '60px', width: '100%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: isActive ? '#f5f7fa' : 'transparent', borderTopLeftRadius: '30px', borderBottomLeftRadius: '30px' }}>
      <div style={{ color: isActive ? themeColor : '#ffffff' }}>{icon}</div>
    </div>
);

export default NcdsPage;