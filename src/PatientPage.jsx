import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Home, User, Activity, LogOut, Plus } from 'lucide-react';
import axios from 'axios';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell 
} from 'recharts';

import maleAvatar from "./assets/male_avatar.png";
import femaleAvatar from "./assets/female_avatar.png";

const API_BASE_URL = 'http://localhost:5001/api';

const PatientPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const themeColor = '#1f0177';

  const [patient, setPatient] = useState(null);
  const [history, setHistory] = useState([]);
  const [selectedTab, setSelectedTab] = useState('diabetes');
  const [selectedYear, setSelectedYear] = useState(2026);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [patientsRes, reportsRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/patients`),
          axios.get(`${API_BASE_URL}/report`)
        ]);

        const foundPatient = patientsRes.data.find(p => p._id === id);
        if (foundPatient) {
          const foundHistory = reportsRes.data
            .filter(r => r.patient_id === id)
            .sort((a, b) => new Date(a.visitDate) - new Date(b.visitDate));

          setPatient(foundPatient);
          setHistory(foundHistory);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, [id]);

  // ✅ สูตรมาตรฐาน Thai ASCVD Score 2 (ซิงค์ตรงกันทุกไฟล์)
  const calculateASCVD = (p, record) => {
    if (!p || !record) return 0;
    const age = Math.abs(new Date(Date.now() - new Date(p.dob).getTime()).getUTCFullYear() - 1970);
    const sex = (p.gender === 'ชาย' || p.gender === 'Male') ? 1 : 0;
    const smoking = (p.is_smoking === true || p.is_smoking === 'Yes' || p.smoking === 'Yes') ? 1 : 0;
    const dm = (record.hba1c >= 6.5) ? 1 : 0;
    const sbp = parseFloat(record.systolic) || 120;
    const chol = parseFloat(record.cholesterol) || 200;

    const fullScore = (0.08183 * age) + (0.39499 * sex) + (0.02084 * sbp) + (0.69974 * dm) + (0.00212 * chol) + (0.41916 * smoking);
    const risk = (1 - Math.pow(0.978296, Math.exp(fullScore - 7.04423))) * 100;
    return risk;
  };

  const calculateAge = (dobString) => {
    if (!dobString) return "-";
    const dob = new Date(dobString);
    const diff = new Date(Date.now() - dob.getTime());
    return `${Math.abs(diff.getUTCFullYear() - 1970)} ปี ${diff.getUTCMonth()} เดือน`;
  };

  const diseaseConfig = {
    diabetes: { label: 'โรคเบาหวาน', sub: '(Diabetes)', unit: 'mmol/L', key: 'hba1c', color: '#2d5bff', icon: '🩸' },
    hypertension: { label: 'โรคความดันโลหิตสูง', sub: '(Hypertension)', unit: 'mmHg', key: 'systolic', color: '#ff4d4f', icon: '❤️' },
    cholesterol: { label: 'โรคไขมันในเลือดสูง', sub: '(High cholesterol)', unit: 'mg/dL', key: 'cholesterol', color: '#ffc107', icon: '💧' },
    obesity: { label: 'โรคอ้วน', sub: '(Obesity)', unit: 'BMI', key: 'bmi', color: '#52c41a', icon: '⚖️' },
    cvd: { label: 'โรคหัวใจและหลอดเลือด', sub: '(ASCVD)', unit: '%', key: 'ascvd', color: '#eb2f96', icon: '📉' },
  };

  const chartData = useMemo(() => {
    return history.map(record => {
      const dateObj = new Date(record.visitDate);
      let value = 0;
      if (selectedTab === 'obesity') {
        value = record.height > 0 ? parseFloat((record.weight / Math.pow(record.height / 100, 2)).toFixed(1)) : 0;
      } else if (selectedTab === 'cvd') {
        value = parseFloat(calculateASCVD(patient, record).toFixed(1));
      } else {
        value = record[diseaseConfig[selectedTab].key] || 0;
      }
      return {
        year: dateObj.getFullYear(),
        date: dateObj.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' }),
        fullDate: dateObj.toLocaleDateString('th-TH'),
        value: value
      };
    });
  }, [history, selectedTab, patient]);

  const filteredLineData = useMemo(() => chartData.filter(d => d.year === selectedYear), [chartData, selectedYear]);

  const barChartData = useMemo(() => {
    return [2024, 2025, 2026].map(year => {
      const records = chartData.filter(d => d.year === year);
      return { name: year, value: records.length > 0 ? records[records.length - 1].value : 0 };
    });
  }, [chartData]);

  const latestRec = chartData.length > 0 ? chartData[chartData.length - 1] : { value: '-', fullDate: '-' };

  return (
    <div style={{ backgroundColor: themeColor, height: '100vh', width: '100vw', display: 'flex', overflow: 'hidden', fontFamily: "'Sarabun', sans-serif" }}>
      <div style={{ width: '85px', flexShrink: 0, position: 'relative', display: 'flex', flexDirection: 'column', zIndex: 20 }}>
        <div style={{ position: 'absolute', top: '40%', left: 0, width: '100%', transform: 'translateY(-50%)', display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <SidebarItem icon={<Home size={26} />} onClick={() => navigate('/ncdsrisk')} themeColor={themeColor} />
          <SidebarItem icon={<User size={26} />} onClick={() => navigate('/patientlist')} themeColor={themeColor} />
          <SidebarItem icon={<Activity size={26} isActive={true} themeColor={themeColor} /> } />
        </div>
        <div style={{ position: 'absolute', bottom: '30px', width: '100%' }}>
          <SidebarItem icon={<LogOut size={26} />} onClick={() => navigate('/')} themeColor={themeColor} />
        </div>
      </div>

      <div style={{ flex: 1, padding: '20px 20px 20px 0', display: 'flex', flexDirection: 'column' }}>
        <div style={{ backgroundColor: '#f0f2f5', width: '100%', height: '100%', borderRadius: '40px', padding: '25px 35px', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
          
          <div style={{ backgroundColor: 'white', borderRadius: '25px', padding: '15px 25px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <img src={patient?.gender === 'หญิง' || patient?.gender === 'Female' ? femaleAvatar : maleAvatar} alt="profile" style={{ width: '65px', height: '65px', borderRadius: '50%', border: '2px solid #eee' }} />
              <div>
                <h2 style={{ margin: 0, fontSize: '20px', color: '#1a3353' }}>{patient?.patientName || '-'}</h2>
                <p style={{ margin: '2px 0 0 0', color: '#777', fontSize: '14px' }}>{patient?.hn_no || '-'}</p>
              </div>
              <div style={{ height: '45px', borderLeft: '1px solid #eee', margin: '0 15px' }}></div>
              <div>
                <p style={{ margin: 0, color: '#888', fontSize: '12px' }}>วันเกิด {patient?.dob ? new Date(patient.dob).toLocaleDateString('th-TH') : '-'} | <b>กรุ๊ปเลือด {patient?.bloodType || 'O'}</b></p>
                <p style={{ margin: '4px 0 0 0', color: '#333', fontSize: '16px', fontWeight: '600' }}>อายุ {calculateAge(patient?.dob)}</p>
              </div>
            </div>
            <AnimatedBackButton onClick={() => navigate(-1)} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button style={subBtnStyle(true)}>NCDs</button>
              <button style={subBtnStyle(false)}>Check-Up</button>
            </div>
            <button style={{ ...subBtnStyle(false), backgroundColor: 'white', color: '#333', border: '1px solid #ddd', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Plus size={16} /> Add Result
            </button>
          </div>

          <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
            {Object.keys(diseaseConfig).map(key => (
              <DiseaseTab key={key} active={selectedTab === key} onClick={() => setSelectedTab(key)} config={diseaseConfig[key]} />
            ))}
          </div>

          <div style={{ display: 'flex', gap: '20px', flex: 1, minHeight: '380px' }}>
            <div style={{ flex: 1.6, backgroundColor: 'white', borderRadius: '25px', padding: '25px', boxShadow: '0 4px 10px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '15px' }}>
                {[2024, 2025, 2026].map(yr => (
                  <button key={yr} onClick={() => setSelectedYear(yr)} style={yrBtnStyle(selectedYear === yr)}>{yr}</button>
                ))}
              </div>
              <div style={{ marginBottom: '10px' }}>
                <span style={{ color: '#666' }}>ค่าสุขภาพล่าสุด </span>
                <span style={{ fontSize: '28px', fontWeight: 'bold', color: diseaseConfig[selectedTab].color }}>{latestRec.value}</span>
                <span style={{ color: '#999', marginLeft: '5px' }}>({diseaseConfig[selectedTab].unit})</span>
                <div style={{ fontSize: '12px', color: '#bbb' }}>วันที่ {latestRec.fullDate}</div>
              </div>
              <div style={{ flex: 1 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={filteredLineData}>
                    <defs>
                      <linearGradient id="curveColor" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={diseaseConfig[selectedTab].color} stopOpacity={0.2}/>
                        <stop offset="95%" stopColor={diseaseConfig[selectedTab].color} stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#999'}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#999'}} />
                    <Tooltip />
                    <Area type="monotone" dataKey="value" stroke={diseaseConfig[selectedTab].color} strokeWidth={4} fill="url(#curveColor)" dot={{ r: 4, fill: diseaseConfig[selectedTab].color }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div style={{ flex: 1, backgroundColor: 'white', borderRadius: '25px', padding: '25px', boxShadow: '0 4px 10px rgba(0,0,0,0.03)' }}>
              <h3 style={{ margin: '0 0 25px 0', fontSize: '16px', color: '#333' }}>เปรียบเทียบย้อนหลัง 3 ปี</h3>
              <div style={{ height: '80%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barChartData} barSize={45}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f5" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                    <YAxis hide />
                    <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                      {barChartData.map((e, i) => <Cell key={i} fill={i === 0 ? '#40a9ff' : i === 1 ? '#ffc107' : '#cf1322'} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const subBtnStyle = (active) => ({ padding: '8px 22px', borderRadius: '12px', border: 'none', fontSize: '14px', fontWeight: 'bold', backgroundColor: active ? '#051b3d' : '#e0e4e8', color: active ? 'white' : '#666', cursor: 'pointer' });
const yrBtnStyle = (active) => ({ padding: '5px 18px', borderRadius: '18px', border: 'none', fontSize: '12px', fontWeight: 'bold', backgroundColor: active ? '#051b3d' : '#e6f7ff', color: active ? 'white' : '#1890ff', cursor: 'pointer' });
const DiseaseTab = ({ active, onClick, config }) => (
  <div onClick={onClick} style={{ flex: 1, minWidth: '180px', backgroundColor: active ? '#051b3d' : 'white', color: active ? 'white' : '#333', padding: '18px', borderRadius: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px', boxShadow: active ? '0 8px 20px rgba(5,27,61,0.2)' : '0 2px 8px rgba(0,0,0,0.04)' }}>
    <div style={{ width: '42px', height: '42px', borderRadius: '50%', backgroundColor: active ? 'rgba(255,255,255,0.15)' : '#f0f2f5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>{config.icon}</div>
    <div><div style={{ fontWeight: 'bold', fontSize: '14px' }}>{config.label}</div><div style={{ fontSize: '11px', opacity: 0.7 }}>{config.sub}</div></div>
  </div>
);
const AnimatedBackButton = ({ onClick }) => {
  const [hover, setHover] = useState(false);
  return <button onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} onClick={onClick} style={{ backgroundColor: hover ? '#e2e8f0' : '#f0f2f5', border: 'none', borderRadius: '50%', width: '45px', height: '45px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', transform: hover ? 'scale(0.92)' : 'scale(1)' }}><ArrowLeft size={22} color={hover ? '#000' : '#333'} /></button>;
};
const SidebarItem = ({ icon, isActive, onClick, themeColor }) => (
  <div onClick={onClick} style={{ height: '60px', width: '100%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: isActive ? '#f0f2f5' : 'transparent', borderTopLeftRadius: '30px', borderBottomLeftRadius: '30px' }}>
    <div style={{ color: isActive ? themeColor : '#ffffff' }}>{icon}</div>
  </div>
);

export default PatientPage;