import React, { useState, useEffect, useMemo } from 'react';
import { Home, User, Activity, LogOut, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import axios from 'axios';

// --- Import รูปภาพ ---
import maleAvatar from "./assets/male_avatar.png";
import femaleAvatar from "./assets/female_avatar.png";

const API_BASE_URL = 'http://localhost:5001/api';

const RiskListPage = () => {
  const navigate = useNavigate();
  const themeColor = '#1f0177';

  // --- States ---
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- Filter States ---
  const [selectedDisease, setSelectedDisease] = useState('โรคความดันโลหิตสูง');
  const [selectedCompany, setSelectedCompany] = useState("ทั้งหมด");
  const [selectedUnit, setSelectedUnit] = useState("ทั้งหมด");
  const [selectedDept, setSelectedDept] = useState("ทั้งหมด");
  const [selectedYear, setSelectedYear] = useState(2026);
  const [selectedRisk, setSelectedRisk] = useState("ทั้งหมด");

  // --- Constants ---
  const DISEASES = ['โรคความดันโลหิตสูง', 'โรคเบาหวาน', 'โรคหัวใจและหลอดเลือด', 'โรคอ้วน', 'โรคไขมันในเลือดสูง'];
  const COMPANIES = ["ทั้งหมด", "บริษัท อินโนวาเทค โซลูชันส์ จำกัด", "บริษัท สมาร์ทเซิร์ฟ รีเทล จำกัด", "บริษัท พรีเมียร แมนูแฟคเจอริ่ง จำกัด"];
  const UNITS = ["ทั้งหมด", "ฝ่ายบริหาร", "ฝ่ายบริหารองค์กร", "ฝ่ายวิศวกรรมดิจิทัล", "ฝ่ายข้อมูลและปัญญาประดิษฐ์", "ฝ่ายกลยุทธ์", "ฝ่ายบริการ", "ฝ่ายค้าปลีก", "ฝ่ายวางแผนการผลิต", "ฝ่ายคุณภาพมาตรฐานโรงงาน", "ฝ่ายบริหารโรงงาน"];
  const DEPARTMENTS = ["ทั้งหมด", "ทรัพยากรบุคคล", "การเงินและบัญชี", "พัฒนาแอปพลิเคชัน", "ทดสอบซอฟต์แวร์", "วิเคราะห์ข้อมูล", "ปัญญาประดิษฐ์", "การตลาด", "โปรโมทและโปรโมชั่น", "บริการลูกค้า", "ดูแลหลังการขาย", "คลังสินค้า", "กระจายสินค้า", "วางแผนการผลิต", "ดูแลเครื่องจักร", "ตรวจสอบคุณภาพ", "ประกันคุณภาพ", "บัญชีต้นทุน"];
  const YEARS = [2026, 2025, 2024];
  const RISKS = ["ทั้งหมด", "ความเสี่ยงสูง", "มีความเสี่ยง", "ค่าปกติ"];

  // --- 1. Fetch Data ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
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
                img: avatarImg,
                company: patient.company,
                unit: patient.unit,
                dept: patient.department,
                history: history
            };
        });

        setPatients(formattedData);
        setLoading(false);
      } catch (err) {
        console.error("Error:", err);
        setError("ไม่สามารถดึงข้อมูลได้");
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // --- 2. Risk Logic ---
  const calculateRisk = (disease, year, history) => {
    const data = history[year];
    if (!data) return { status: 'Unknown', value: '-', color: '#ccc' };

    let status = 'ค่าปกติ';
    let color = '#40a9ff'; 
    let valueDisplay = '';

    switch (disease) {
      case 'โรคความดันโลหิตสูง':
        valueDisplay = `${data.sys}/${data.dia}`;
        if (data.sys >= 140 || data.dia >= 90) { 
            status = 'ความเสี่ยงสูง'; color = '#ff4d4f'; 
        } else if ((data.sys >= 120 && data.sys <= 139) || (data.dia >= 80 && data.dia <= 89)) { 
            status = 'มีความเสี่ยง'; color = '#ffc107'; 
        }
        break;
      case 'โรคเบาหวาน':
        valueDisplay = data.hba1c;
        if (data.hba1c >= 6.5) { status = 'ความเสี่ยงสูง'; color = '#ff4d4f'; }
        else if (data.hba1c >= 5.7) { status = 'มีความเสี่ยง'; color = '#ffc107'; }
        break;
      case 'โรคหัวใจและหลอดเลือด':
        valueDisplay = data.ldl;
        if (data.ldl >= 160) { status = 'ความเสี่ยงสูง'; color = '#ff4d4f'; }
        else if (data.ldl >= 100) { status = 'มีความเสี่ยง'; color = '#ffc107'; }
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

  // --- 3. Filter ---
  const filteredData = useMemo(() => {
    return patients.map(p => {
        const currentRisk = calculateRisk(selectedDisease, selectedYear, p.history);
        const prevRisk = calculateRisk(selectedDisease, selectedYear - 1, p.history);
        return { ...p, current: currentRisk, prev: prevRisk };
    }).filter(item => {
        const matchCompany = selectedCompany === "ทั้งหมด" || item.company === selectedCompany;
        const matchUnit = selectedUnit === "ทั้งหมด" || item.unit === selectedUnit;
        const matchDept = selectedDept === "ทั้งหมด" || item.dept === selectedDept;
        
        let riskFilter = true;
        if(selectedRisk !== "ทั้งหมด") {
            riskFilter = item.current.status === selectedRisk;
        }

        return matchCompany && matchUnit && matchDept && riskFilter;
    });
  }, [patients, selectedDisease, selectedCompany, selectedUnit, selectedDept, selectedYear, selectedRisk]);

  // --- 4. Chart Data ---
  const chartData = useMemo(() => {
    let high = 0, risk = 0, normal = 0;
    filteredData.forEach(p => {
        if (p.current.status === 'ความเสี่ยงสูง') high++;
        else if (p.current.status === 'มีความเสี่ยง') risk++;
        else if (p.current.status === 'ค่าปกติ') normal++;
    });

    if(high === 0 && risk === 0 && normal === 0) return [];

    return [
        { name: 'มีความเสี่ยง', value: risk, color: '#ffc107' },
        { name: 'ความเสี่ยงสูง', value: high, color: '#ff4d4f' },
        { name: 'ค่าปกติ', value: normal, color: '#40a9ff' },
    ].filter(d => d.value > 0);
  }, [filteredData]);

  const totalCount = filteredData.length;
  const normalCount = filteredData.filter(d => d.current.status === 'ค่าปกติ').length;
  const riskCount = filteredData.filter(d => d.current.status === 'มีความเสี่ยง').length;
  const highCount = filteredData.filter(d => d.current.status === 'ความเสี่ยงสูง').length;

  if (loading) return <div style={{height:'100vh', display:'flex', justifyContent:'center', alignItems:'center', backgroundColor:themeColor, color:'white'}}>Loading...</div>;

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
                                    paddingAngle={2} 
                                    dataKey="value"
                                >
                                    {chartData.map((entry, index) => {
                                        const isHighRisk = entry.name === 'ความเสี่ยงสูง';
                                        return (
                                            <Cell 
                                                key={`cell-${index}`} 
                                                fill={entry.color} 
                                                stroke="white"
                                                strokeWidth={2}
                                                style={{ 
                                                    transform: isHighRisk ? 'scale(1.1)' : 'scale(1)', 
                                                    transformOrigin: 'center',
                                                    transition: 'all 0.3s',
                                                    outline: 'none'
                                                }}
                                            />
                                        );
                                    })}
                                </Pie>
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    {/* ✅ แก้ไข: เพิ่ม Padding เป็น 60px ให้บีบเข้ามา และ Margin บน 10px */}
                    <div style={{ marginTop: '10px', padding: '0 200px' }}>
                        <StatRow label="ทั้งหมด :" value={`${totalCount} คน`} color="#333" />
                        <StatRow label="ค่าปกติ :" value={`${normalCount} คน`} color="#40a9ff" />
                        <StatRow label="มีความเสี่ยง :" value={`${riskCount} คน`} color="#ffc107" />
                        <StatRow label="ความเสี่ยงสูง :" value={`${highCount} คน`} color="#ff4d4f"/>
                    </div>
                </div>

                {/* Right: List */}
                <div style={{ flex: 1, backgroundColor: 'white', borderRadius: '20px', padding: '0', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#888', padding: '20px 20px 10px 20px', fontSize: '14px', borderBottom: '1px solid #eee' }}>
                        <div style={{ width: '40%' }}>ชื่อ</div>
                        <div style={{ width: '25%', textAlign: 'center' }}>ค่าล่าสุด</div>
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
                                    <div style={{ width: '25%', textAlign: 'center', color: '#aaa' }}>{item.prev.valueDisplay}</div>
                                    <div style={{ width: '10%', display: 'flex', justifyContent: 'flex-end' }}>
                                        <button style={{ width: '35px', height: '35px', borderRadius: '50%', border: 'none', backgroundColor: '#2d5bff', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
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

// ✅ แก้ไข: ลด marginBottom เหลือ 5px เพื่อให้บรรทัดชิดกัน
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