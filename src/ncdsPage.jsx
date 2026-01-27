import React, { useState, useEffect, useRef } from 'react';
import { Home, User, Activity, LogOut } from 'lucide-react'; 
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList } from 'recharts';
import axios from 'axios'; 

// --- Import รูปภาพ PNG ---
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

  const lastUpdateRef = useRef({
    dataString: "",
    totalCount: -1 
  });

  const fetchHealthData = async () => {
    try {
      const response = await axios.get('http://localhost:5001/api/report');
      const allRecords = response.data;

      const uniquePatientsMap = new Map();
      allRecords.forEach(record => {
        if (record.patient_id && !uniquePatientsMap.has(record.patient_id)) {
            uniquePatientsMap.set(record.patient_id, record);
        }
      });
      const latestRecords = Array.from(uniquePatientsMap.values());
      const currentTotal = latestRecords.length;

      let countHT = 0, countDM = 0, countCVD = 0, countObesity = 0, countHyper = 0;

      latestRecords.forEach(p => {
        const weight = parseFloat(p.weight) || 0;
        const height = parseFloat(p.height) || 0;
        const sys = parseFloat(p.systolic) || 0;
        const dia = parseFloat(p.diastolic) || 0;
        const hba1c = parseFloat(p.hba1c) || 0;
        const ldl = parseFloat(p.ldl) || 0;
        const chol = parseFloat(p.cholesterol) || 0;

        let bmi = 0;
        if (height > 0) {
            const heightInM = height / 100;
            bmi = weight / (heightInM * heightInM);
        }

        if (sys >= 140 || dia >= 90) countHT++;
        if (hba1c >= 6.5) countDM++;
        if (ldl >= 160) countCVD++;
        if (bmi >= 25) countObesity++;
        if (chol >= 240) countHyper++;
      });

      const newData = [
        { name: 'โรคความดันโลหิตสูง', count: countHT },
        { name: 'โรคเบาหวาน', count: countDM },
        { name: 'โรคหัวใจและหลอดเลือด', count: countCVD },
        { name: 'โรคอ้วน', count: countObesity },
        { name: 'โรคไขมันในเลือดสูง', count: countHyper },
      ];

      const newDataString = JSON.stringify(newData);
      const prevData = lastUpdateRef.current;

      if (prevData.dataString !== newDataString || prevData.totalCount !== currentTotal) {
          console.log("Updated Graph");
          setChartData(newData);
          setTotalPatients(currentTotal);
          lastUpdateRef.current = {
            dataString: newDataString,
            totalCount: currentTotal
          };
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
    // เปลี่ยน fontFamily ตรงนี้เป็น 'Prompt'
    <div style={{ backgroundColor: themeColor, height: '100vh', width: '100vw', display: 'flex', overflow: 'hidden', fontFamily: "'Prompt', sans-serif" }}>
      
      {/* Sidebar */}
      <div style={{ width: '85px', flexShrink: 0, position: 'relative', display: 'flex', flexDirection: 'column', zIndex: 20 }}>
        <div style={{ position: 'absolute', top: '40%', left: 0, width: '100%', transform: 'translateY(-50%)', display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <SidebarItem icon={<Home size={26} />} isActive={true} onClick={() => {}} themeColor={themeColor} contentColor={contentColor} />
          <SidebarItem icon={<User size={26} />} isActive={false} onClick={() => navigate('/patientlist')} themeColor={themeColor} contentColor={contentColor} />
          <SidebarItem icon={<Activity size={26} />} isActive={false} onClick={() => navigate('/risklist')} themeColor={themeColor} contentColor={contentColor} />
        </div>
        <div style={{ position: 'absolute', bottom: '30px', width: '100%' }}>
           <SidebarItem icon={<LogOut size={26} />} isActive={false} onClick={() => navigate('/')} themeColor={themeColor} contentColor={contentColor} />
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, position: 'relative', display: 'flex', flexDirection: 'column', padding: '20px 20px 20px 0' }}>
        
        <div style={{ backgroundColor: '#f5f7fa', width: '100%', height: '100%', borderRadius: '40px', padding: '30px', display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 10, overflow: 'auto' }}>
          
          <div style={{ minWidth: '900px', display: 'flex', flexDirection: 'column', height: '100%' }}>

            {/* Header */}
            <div style={{ marginBottom: '15px' }}>
               <h2 style={{ color: 'black', margin: 0, fontSize: '22px' }}>ความเสี่ยงสุขภาพทั้งระบบ</h2>
            </div>

            {/* Content Body */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', flex: 1 }}>
              
              {/* Chart Section */}
              <div style={{ backgroundColor: '#fff', borderRadius: '20px', padding: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', flex: 1, minHeight: '350px', display: 'flex', flexDirection: 'column' }}>
                  
                  <p style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '15px', color: '#555' }}>
                    ผู้ป่วยทั้งหมด {totalPatients.toLocaleString()} คน
                  </p>
                  
                  <div style={{ flex: 1, width: '100%' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                        <XAxis dataKey="name" tick={{ fontSize: 14 }} axisLine={false} tickLine={false} interval={0} />
                        <YAxis axisLine={false} tickLine={false} />
                        <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }} />
                        <Bar dataKey="count" fill={themeColor} radius={[6, 6, 0, 0]} barSize={60} animationDuration={1000}>
                          <LabelList dataKey="count" position="top" fill="#666" fontSize={16} offset={5} formatter={(val) => `${val} คน`} />
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
              </div>
              
              {/* Risk Cards Section */}
              <div>
                 <h3 style={{ color: '#333', marginBottom: '15px', fontSize: '20px' }}>กลุ่มความเสี่ยงเฉพาะโรค</h3>
                 <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
                    gap: '15px' 
                 }}>
                    <RiskCard 
                      title="โรคความดันโลหิตสูง" 
                      subtitle="(Hypertension)" 
                      icon={<img src={hypertensionPic} alt="HT" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />} 
                      color="#e7f5ff" 
                      onClick={() => console.log('Click HT')} 
                    />
                    <RiskCard 
                      title="โรคเบาหวาน" 
                      subtitle="(Diabetes)" 
                      icon={<img src={diabetesPic} alt="DM" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />} 
                      color="#fff5f5" 
                      onClick={() => console.log('Click DM')} 
                    />
                    <RiskCard 
                      title="โรคหัวใจและหลอดเลือด" 
                      subtitle="(CVD)" 
                      icon={<img src={cvdPic} alt="CVD" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />} 
                      color="#ffe3e3" 
                      onClick={() => console.log('Click CVD')} 
                    />
                    <RiskCard 
                      title="โรคอ้วน" 
                      subtitle="(Obesity)" 
                      icon={<img src={obesityPic} alt="Obesity" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />} 
                      color="#fff9db" 
                      onClick={() => console.log('Click Obesity')} 
                    />
                    <RiskCard 
                      title="โรคไขมันในเลือดสูง" 
                      subtitle="(High cholesterol)" 
                      icon={<img src={cholesterolPic} alt="Cholesterol" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />} 
                      color="#ebfbee" 
                      onClick={() => console.log('Click Hyper')} 
                    />
                 </div>
              </div>

            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

// --- Sub-Components ---

const RiskCard = ({ title, subtitle, icon, color, onClick }) => {
  return (
    <div 
      onClick={onClick}
      style={{ 
        backgroundColor: '#fff', 
        borderRadius: '16px',
        padding: '15px 20px',
        display: 'flex', 
        alignItems: 'center', 
        gap: '15px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
        cursor: 'pointer',
        transition: 'all 0.2s',
        minHeight: '100px'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-5px)';
        e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.1)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.06)';
      }}
    >
      <div style={{ 
        width: '70px', 
        height: '70px', 
        borderRadius: '50%', 
        backgroundColor: color, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        flexShrink: 0,
        padding: '10px'
      }}>
        {icon}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        {/* ใช้ฟอนต์ Prompt (ถ้าโหลดมาแล้ว) ขนาดเล็กลง */}
        <span style={{ fontSize: '12.5px', fontWeight: '500', color: '#333', marginBottom: '4px' }}>{title}</span>
        <span style={{ fontSize: '13px', color: '#777', fontWeight: '300' }}>{subtitle}</span>
      </div>
    </div>
  )
}

const SidebarItem = ({ icon, isActive, onClick, themeColor, contentColor }) => (
    <div onClick={onClick} style={{ height: '60px', width: '100%', position: 'relative', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: isActive ? '#f5f7fa' : 'transparent', borderTopLeftRadius: '30px', borderBottomLeftRadius: '30px', transition: 'all 0.2s', marginRight: isActive ? '-1px' : '0' }}>
      {isActive && <div style={{ position: 'absolute', top: '-20px', right: '0', width: '20px', height: '20px', backgroundColor: 'transparent', borderBottomRightRadius: '20px', boxShadow: `5px 5px 0 5px #f5f7fa`, zIndex: 1 }}></div>}
      {isActive && <div style={{ position: 'absolute', bottom: '-20px', right: '0', width: '20px', height: '20px', backgroundColor: 'transparent', borderTopRightRadius: '20px', boxShadow: `5px -5px 0 5px #f5f7fa`, zIndex: 1 }}></div>}
      <div style={{ position: 'relative', zIndex: 5, color: isActive ? themeColor : '#ffffff', transform: isActive ? 'scale(1.1)' : 'scale(1)' }}>{icon}</div>
      {isActive && <div style={{ position: 'absolute', right: '-10px', top: 0, width: '20px', height: '100%', backgroundColor: '#f5f7fa', zIndex: 2 }} />}
    </div>
);

export default NcdsPage;