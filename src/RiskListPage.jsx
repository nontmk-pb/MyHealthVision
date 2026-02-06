import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Home, User, Activity, LogOut, FileText } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { PieChart, Pie, ResponsiveContainer, Sector } from 'recharts';
import axios from 'axios';

// --- Import รูปภาพ (ตรวจสอบ Path ของคุณให้ถูกต้อง) ---
import maleAvatar from "./assets/male_avatar.png";
import femaleAvatar from "./assets/female_avatar.png";

const API_BASE_URL = 'http://localhost:5001/api';

// ✅ ฟังก์ชันวาดกราฟแบบกำหนดเอง (Custom Shape)
// ทำหน้าที่กำหนดระยะห่าง (offset) ของแต่ละชิ้นตามเงื่อนไข
const renderCustomShape = (props) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, midAngle, payload } = props;
  const RADIAN = Math.PI / 180;
  
  // ----------------------------------------------------
  // ✅ กำหนดระยะห่างตามเงื่อนไขที่ต้องการ
  let offset = 0;

  if (payload.name === 'ความเสี่ยงสูง') {
      offset = 20; // สีแดง -> ห่าง 20px
  } else if (payload.name === 'มีความเสี่ยง') {
      offset = 7;  // สีเหลือง -> ห่าง 5px
  } else {
      offset = 0;  // สีฟ้า -> อยู่ที่เดิม
  }
  // ----------------------------------------------------
  
  // คำนวณพิกัดใหม่ (x, y) โดยบวกค่า offset เข้าไป
  const x = cx + offset * Math.cos(-midAngle * RADIAN);
  const y = cy + offset * Math.sin(-midAngle * RADIAN);

  return (
    <g>
      <Sector
        cx={x} 
        cy={y} 
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        stroke="none"
        // ใส่เงาเฉพาะชิ้นที่ลอยออกมา (offset > 0)
        style={offset > 0 ? { filter: 'drop-shadow(2px 4px 6px rgba(0,0,0,0.25))' } : {}}
      />
    </g>
  );
};

const RiskListPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const themeColor = '#1f0177';

  // --- States ---
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- Filter States ---
  const [selectedDisease, setSelectedDisease] = useState( location.state?.disease || 'โรคความดันโลหิตสูง');
  const [selectedCompany, setSelectedCompany] = useState("ทั้งหมด");
  const [selectedUnit, setSelectedUnit] = useState("ทั้งหมด");
  const [selectedDept, setSelectedDept] = useState("ทั้งหมด");
  const [selectedYear, setSelectedYear] = useState(2026);
  const [selectedRisk, setSelectedRisk] = useState("ทั้งหมด");

  const DISEASES = ['โรคความดันโลหิตสูง', 'โรคเบาหวาน', 'โรคหัวใจและหลอดเลือด', 'โรคอ้วน', 'โรคไขมันในเลือดสูง'];
  const COMPANIES = ["ทั้งหมด", "บริษัท อินโนวาเทค โซลูชันส์ จำกัด", "บริษัท สมาร์ทเซิร์ฟ รีเทล จำกัด", "บริษัท พรีเมียร แมนูแฟคเจอริ่ง จำกัด"];
  const UNITS = ["ทั้งหมด", "ฝ่ายบริหาร", "ฝ่ายบริหารองค์กร", "ฝ่ายวิศวกรรมดิจิทัล", "ฝ่ายข้อมูลและปัญญาประดิษฐ์", "ฝ่ายกลยุทธ์", "ฝ่ายบริการ", "ฝ่ายค้าปลีก", "ฝ่ายวางแผนการผลิต", "ฝ่ายคุณภาพมาตรฐานโรงงาน", "ฝ่ายบริหารโรงงาน"];
  const DEPARTMENTS = ["ทั้งหมด", "ทรัพยากรบุคคล", "การเงินและบัญชี", "พัฒนาแอปพลิเคชัน", "ทดสอบซอฟต์แวร์", "วิเคราะห์ข้อมูล", "ปัญญาประดิษฐ์", "การตลาด", "โปรโมทและโปรโมชั่น", "บริการลูกค้า", "ดูแลหลังการขาย", "คลังสินค้า", "กระจายสินค้า", "วางแผนการผลิต", "ดูแลเครื่องจักร", "ตรวจสอบคุณภาพ", "ประกันคุณภาพ", "บัญชีต้นทุน"];
  const YEARS = [2026, 2025, 2024];
  const RISKS = ["ทั้งหมด", "ความเสี่ยงสูง", "มีความเสี่ยง", "ค่าปกติ"];

  const calculateASCVD = (p, record) => {
    if (!p || !record) return 0;
    // คำนวณอายุจาก dob เสมอเพื่อให้ตรงกันทุกหน้า
    const age = Math.abs(new Date(Date.now() - new Date(p.dob).getTime()).getUTCFullYear() - 1970);
    const sex = (p.gender === 'ชาย' || p.gender === 'Male') ? 1 : 0;
    const smoking = (p.is_smoking === true || p.is_smoking === 'Yes' || p.smoking === 'Yes') ? 1 : 0;
    const dm = (record.hba1c >= 6.5) ? 1 : 0;
    
    // ดึงค่าจาก record (หน้านี้ใช้ sys และ chol ในการเก็บเข้า history)
    const sbp = parseFloat(record.sys || record.systolic) || 120;
    const cholValue = parseFloat(record.chol || record.cholesterol) || 200;

    const fullScore = (0.08183 * age) + (0.39499 * sex) + (0.02084 * sbp) + (0.69974 * dm) + (0.00212 * cholValue) + (0.41916 * smoking);
    const risk = (1 - Math.pow(0.978296, Math.exp(fullScore - 7.04423))) * 100;
    return risk;
  };

  // --- Fetch Data Logic ---
  const fetchData = useCallback(async (isBackground = false) => {
    try {
      if (!isBackground) setLoading(true);
      const [patientsRes, reportsRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/patients`),
        axios.get(`${API_BASE_URL}/report`)
      ]);

      const formattedData = patientsRes.data.map(patient => {
          const patientReports = reportsRes.data.filter(r => r.patient_id === patient._id);
          const history = {};
          
          patientReports.forEach(report => {
              const year = new Date(report.visitDate).getFullYear();
              let calculatedBMI = 0;
              if(report.weight && report.height) {
                  const hMeter = report.height / 100;
                  calculatedBMI = (report.weight / (hMeter * hMeter)).toFixed(1);
              }
              if(!history[year]) {
                  history[year] = {
                      sys: report.systolic,
                      dia: report.diastolic,
                      hba1c: report.hba1c,
                      ldl: report.ldl,
                      chol: report.cholesterol,
                      bmi: parseFloat(calculatedBMI) || 0,
                      visitDate: report.visitDate
                  };
              }
          });
          let avatarImg = maleAvatar;
          if (patient.gender === 'หญิง' || patient.gender === 'Female') {
              avatarImg = femaleAvatar;
          }
          return {
              id: patient._id,
              name: patient.patientName,
              dob: patient.dob,
              gender: patient.gender,
              smoking: patient.smoking,
              img: avatarImg,
              company: patient.company,
              unit: patient.unit,
              dept: patient.department,
              history: history
          };
      });
      setPatients(formattedData);
      if (!isBackground) setLoading(false);
    } catch (err) {
      console.error("Error:", err);
      if (!isBackground) setLoading(false);
    }
  }, []);

  // --- Real-time Polling ---
  useEffect(() => {
    fetchData(false);
    const intervalId = setInterval(() => { fetchData(true); }, 3000);
    return () => clearInterval(intervalId);
  }, [fetchData]);

  // --- Risk Calculation ---
  const calculateRisk = (disease, year, history, patientProfile) => {
    const data = history[year];
    if (!data) return { status: 'Unknown', value: '-', color: '#ccc' };
    let status = 'ค่าปกติ';
    let color = '#40a9ff'; 
    let valueDisplay = '';

    switch (disease) {
      case 'โรคความดันโลหิตสูง':
        valueDisplay = `${data.sys}/${data.dia}`;
        if (data.sys >= 140 || data.dia >= 90) { status = 'ความเสี่ยงสูง'; color = '#ff4d4f'; }
        else if (data.sys >= 120 && data.sys >= 80) { status = 'มีความเสี่ยง'; color = '#ffc107'; }
        break;
      case 'โรคเบาหวาน':
        valueDisplay = data.hba1c;
        if (data.hba1c >= 6.5) { status = 'ความเสี่ยงสูง'; color = '#ff4d4f'; }
        else if (data.hba1c >= 5.7) { status = 'มีความเสี่ยง'; color = '#ffc107'; }
        break;
      case 'โรคหัวใจและหลอดเลือด':
        const score = calculateASCVD(patientProfile, data);
        valueDisplay = score.toFixed(1) + '%';
        if (score >= 20) { status = 'ความเสี่ยงสูง'; color = '#ff4d4f'; }
        else if (score >= 10) { status = 'มีความเสี่ยง'; color = '#ffc107'; }
        break;
      case 'โรคอ้วน':
        valueDisplay = data.bmi;
        if (data.bmi >= 25) { status = 'ความเสี่ยงสูง'; color = '#ff4d4f'; }
        else if (data.bmi >= 23) { status = 'มีความเสี่ยง'; color = '#ffc107'; }
        break;
      case 'โรคไขมันในเลือดสูง':
        valueDisplay = data.chol;
        if (data.chol >= 240) { status = 'ความเสี่ยงสูง'; color = '#ff4d4f'; }
        else if (data.chol >= 200) { status = 'มีความเสี่ยง'; color = '#ffc107'; }
        break;
      default: break;
    }
    return { status, valueDisplay, color };
  };

  const filteredData = useMemo(() => {
    return patients.map(p => {
        const currentRisk = calculateRisk(selectedDisease, selectedYear, p.history, p);
        const prevRisk = calculateRisk(selectedDisease, selectedYear - 1, p.history, p);
        return { ...p, current: currentRisk, prev: prevRisk };
    }).filter(item => {
        const matchCompany = selectedCompany === "ทั้งหมด" || item.company === selectedCompany;
        const matchUnit = selectedUnit === "ทั้งหมด" || item.unit === selectedUnit;
        const matchDept = selectedDept === "ทั้งหมด" || item.dept === selectedDept;
        let riskFilter = true;
        if(selectedRisk !== "ทั้งหมด") { riskFilter = item.current.status === selectedRisk; }
        return matchCompany && matchUnit && matchDept && riskFilter;
    });
  }, [patients, selectedDisease, selectedCompany, selectedUnit, selectedDept, selectedYear, selectedRisk]);

  const chartData = useMemo(() => {
    let high = 0, risk = 0, normal = 0;
    filteredData.forEach(p => {
        if (p.current.status === 'ความเสี่ยงสูง') high++;
        else if (p.current.status === 'มีความเสี่ยง') risk++;
        else if (p.current.status === 'ค่าปกติ') normal++;
    });

    if(high === 0 && risk === 0 && normal === 0) return [];

    return [
        { name: 'มีความเสี่ยง', value: risk, fill: '#ffc107' },
        { name: 'ความเสี่ยงสูง', value: high, fill: '#ff4d4f' },
        { name: 'ค่าปกติ', value: normal, fill: '#40a9ff' },
    ].filter(d => d.value > 0);
  }, [filteredData]);

  const totalCount = filteredData.length;
  const normalCount = filteredData.filter(d => d.current.status === 'ค่าปกติ').length;
  const riskCount = filteredData.filter(d => d.current.status === 'มีความเสี่ยง').length;
  const highCount = filteredData.filter(d => d.current.status === 'ความเสี่ยงสูง').length;

  return (
    <div style={{ backgroundColor: themeColor, height: '100vh', width: '100vw', display: 'flex', overflow: 'hidden', fontFamily: "'Sarabun', 'Arial', sans-serif" }}>
      
      {/* Sidebar */}
      <div style={{ width: '85px', flexShrink: 0, position: 'relative', display: 'flex', flexDirection: 'column', zIndex: 20 }}>
        <div style={{ position: 'absolute', top: '40%', left: 0, width: '100%', transform: 'translateY(-50%)', display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <SidebarItem icon={<Home size={26} />} onClick={() => navigate('/ncdsrisk')} themeColor={themeColor} />
          <SidebarItem icon={<User size={26} />} onClick={() => navigate('/patientlist')} themeColor={themeColor} />
          <SidebarItem icon={<Activity size={26} />} isActive={true} onClick={() => {}} themeColor={themeColor} />
        </div>
        <div style={{ position: 'absolute', bottom: '30px', width: '100%' }}>
           <SidebarItem icon={<LogOut size={26} />} onClick={() => navigate('/')} themeColor={themeColor} />
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, position: 'relative', display: 'flex', flexDirection: 'column', padding: '20px 20px 20px 0' }}>
        <div style={{ backgroundColor: '#f0f2f5', width: '100%', height: '100%', borderRadius: '40px', padding: '20px 30px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

            {/* Filter Row */}
            <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', flexWrap: 'wrap' }}>
                <FilterDropdown label="กลุ่มโรค" value={selectedDisease} onChange={e => setSelectedDisease(e.target.value)} options={DISEASES} width="200px" />
                <FilterDropdown label="บริษัท" value={selectedCompany} onChange={e => setSelectedCompany(e.target.value)} options={COMPANIES} width="220px" />
                <FilterDropdown label="หน่วยงาน" value={selectedUnit} onChange={e => setSelectedUnit(e.target.value)} options={UNITS} width="160px" />
                <FilterDropdown label="แผนก" value={selectedDept} onChange={e => setSelectedDept(e.target.value)} options={DEPARTMENTS} width="160px" />
                <FilterDropdown label="ปี ค.ศ." value={selectedYear} onChange={e => setSelectedYear(parseInt(e.target.value))} options={YEARS} width="100px" />
                <FilterDropdown label="ความเสี่ยง" value={selectedRisk} onChange={e => setSelectedRisk(e.target.value)} options={RISKS} width="140px" />
            </div>

            {/* Content Body */}
            <div style={{ display: 'flex', gap: '20px', flex: 1, overflow: 'hidden' }}>
                
                {/* Left: Graph (Pie Chart) */}
                <div style={{ flex: 1, backgroundColor: 'white', borderRadius: '20px', padding: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ margin: '0 0 10px 0', color: '#666', fontSize: '18px' }}>กราฟความเสี่ยง</h3>
                    
                    <div style={{ flex: 1, position: 'relative' }}>
                         <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie 
                                    data={chartData} 
                                    cx="50%" cy="50%" 
                                    innerRadius={0} 
                                    outerRadius={135}
                                    
                                    // เพิ่มช่องว่างระหว่างชิ้น
                                    paddingAngle={0}
                                    
                                    dataKey="value"
                                    
                                    // สั่งให้วาดกราฟด้วยฟังก์ชัน custom ของเรา
                                    shape={renderCustomShape}
                                    
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    <div style={{ marginTop: '30px', padding: '0 220px' }}>
                        <StatRow label="ทั้งหมด :" value={`${totalCount} คน`} color="#333" />
                        <StatRow label="ค่าปกติ :" value={`${normalCount} คน`} color="#40a9ff" />
                        <StatRow label="มีความเสี่ยง :" value={`${riskCount} คน`} color="#ffc107" />
                        <StatRow label="ความเสี่ยงสูง :" value={`${highCount} คน`} color="#ff4d4f" valueColor="#ff4d4f"/>
                    </div>
                </div>

                {/* Right: List */}
                <div style={{ flex: 1, backgroundColor: 'white', borderRadius: '20px', padding: '0', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#888', padding: '20px 20px 10px 20px', fontSize: '14px', borderBottom: '1px solid #eee' }}>
                        <div style={{ width: '40%' }}>ชื่อ</div>
                        <div style={{ width: '18%', textAlign: 'center' }}>ค่าล่าสุด</div>
                        <div style={{ width: '25%', textAlign: 'center' }}>1 ปีก่อน</div>
                        <div style={{ width: '10%' }}></div>
                    </div>

                    <div style={{ flex: 1, overflowY: 'auto', padding: '0 10px' }}>
                        {filteredData.length === 0 ? (
                            <div style={{ textAlign: 'center', marginTop: '40px', color: '#ccc' }}>ไม่พบข้อมูล</div>
                        ) : (
                            filteredData.map((item) => (
                                <div key={item.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '15px 10px', borderBottom: '1px solid #f9f9f9' }}>
                                    <div style={{ width: '40%', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <div style={{ width: '45px', height: '45px', borderRadius: '50%', overflow: 'hidden', border: '1px solid #eee' }}>
                                            <img src={item.img} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <span style={{ fontSize: '14px', fontWeight: '500', color: '#333' }}>{item.name}</span>
                                            <span style={{ fontSize: '11px', color: '#999' }}>{item.dept}</span>
                                        </div>
                                    </div>
                                    <div style={{ width: '25%', textAlign: 'center', fontWeight: 'bold', color: item.current.color }}>{item.current.valueDisplay}</div>
                                    <div style={{ width: '25%', textAlign: 'center', fontWeight: '500' , color: item.current.color }}>{item.prev.valueDisplay}</div>
                                    <div style={{ width: '10%', display: 'flex', justifyContent: 'flex-end' }}>
                                        <button 
                                            onClick={() => navigate(`/patient/${item.id}`)}
                                            style={{ width: '35px', height: '35px', borderRadius: '50%', border: 'none', backgroundColor: '#2d5bff', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                                        >
                                            <FileText size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

            </div>
        </div>
      </div>
    </div>
  );
};

// --- Helper Components ---
const FilterDropdown = ({ label, value, onChange, options, width = '100%' }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
        <span style={{ fontSize: '13px', fontWeight: '600', color: '#333' }}>{label}</span>
        <div style={{ position: 'relative', width: width }}>
            <select value={value} onChange={onChange} style={{ appearance: 'none', width: '100%', padding: '10px 30px 10px 15px', borderRadius: '25px', border: '1px solid #e0e0e0', backgroundColor: 'white', fontSize: '14px', color: '#333', outline: 'none', cursor: 'pointer' }}>
                {options.map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
            </select>
            <div style={{ position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#888', fontSize: '10px' }}>▼</div>
        </div>
    </div>
);

const StatRow = ({ label, value, color, valueColor }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', fontSize: '14px' }}>
        <span style={{ color: color, fontWeight: '500' }}>{label}</span>
        <span style={{ fontWeight: 'bold', color: valueColor || color }}>{value}</span>
    </div>
);

const SidebarItem = ({ icon, isActive, onClick, themeColor }) => (
    <div onClick={onClick} style={{ height: '60px', width: '100%', position: 'relative', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: isActive ? '#f0f2f5' : 'transparent', borderTopLeftRadius: '30px', borderBottomLeftRadius: '30px', transition: 'all 0.2s', marginRight: isActive ? '-1px' : '0' }}>
      {isActive && <div style={{ position: 'absolute', top: '-20px', right: '0', width: '20px', height: '20px', boxShadow: `5px 5px 0 5px #f0f2f5`, borderBottomRightRadius: '20px' }}></div>}
      <div style={{ position: 'relative', zIndex: 5, color: isActive ? themeColor : '#ffffff', transform: isActive ? 'scale(1.1)' : 'scale(1)' }}>{icon}</div>
      {isActive && <div style={{ position: 'absolute', bottom: '-20px', right: '0', width: '20px', height: '20px', boxShadow: `5px -5px 0 5px #f0f2f5`, borderTopRightRadius: '20px' }}></div>}
    </div>
);

export default RiskListPage;
