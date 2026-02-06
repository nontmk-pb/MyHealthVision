import React, { useState, useEffect } from 'react';
import { Home, User, Activity, LogOut, Search, Plus, FileText, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// --- IMPORT รูปภาพ AVATAR ---
import maleAvatar from './assets/male_avatar.png';       
import femaleAvatar from './assets/female_avatar.png';   

const PatientListPage = () => {
  const navigate = useNavigate();
  const themeColor = '#1f0177'; 
  const contentColor = '#ffffff'; 

  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // State สำหรับ Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUnit, setSelectedUnit] = useState('ทั้งหมด');
  const [selectedDept, setSelectedDept] = useState('ทั้งหมด');
  const [selectedCompany, setSelectedCompany] = useState('ทั้งหมด');

  const companies = [ "ทั้งหมด", "บริษัท อินโนวาเทค โซลูชันส์ จำกัด", "บริษัท สมาร์ทเซิร์ฟ รีเทล จำกัด", "บริษัท พรีเมียร แมนูแฟคเจอริ่ง จำกัด" ];
  const units = [ "ทั้งหมด", "ฝ่ายบริหาร", "ฝ่ายบริหารองค์กร", "ฝ่ายวิศวกรรมดิจิทัล", "ฝ่ายข้อมูลและปัญญาประดิษฐ์", "ฝ่ายกลยุทธ์", "ฝ่ายบริการ", "ฝ่ายค้าปลีก", "ฝ่ายวางแผนการผลิต", "ฝ่ายคุณภาพมาตรฐานโรงงาน", "ฝ่ายบริหารโรงงาน" ];
  const departments = [ "ทั้งหมด", "ทรัพยากรบุคคล", "การเงินและบัญชี", "พัฒนาแอปพลิเคชัน", "ทดสอบซอฟต์แวร์", "วิเคราะห์ข้อมูล", "ปัญญาประดิษฐ์", "การตลาด", "โปรโมทและโปรโมชั่น", "บริการลูกค้า", "ดูแลหลังการขาย", "คลังสินค้า", "กระจายสินค้า", "วางแผนการผลิต", "ดูแลเครื่องจักร", "ตรวจสอบคุณภาพ", "ประกันคุณภาพ", "บัญชีต้นทุน" ];

  // --- API ---
  const fetchPatients = async () => {
      try {
        const response = await axios.get('http://localhost:5001/api/patients');
        setPatients(response.data);
        if(loading) setLoading(false); 
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
  };

  useEffect(() => {
    fetchPatients(); 
    const intervalId = setInterval(() => { fetchPatients(); }, 3000);
    return () => clearInterval(intervalId);
  }, []);

  // --- Utility ---
  const formatThaiDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear() + 543;
    return `${day}/${month}/${year}`;
  };

  const formatGender = (gender) => {
    if (!gender) return '-';
    const g = gender.toLowerCase();
    return (g === 'male' || g === 'ชาย') ? 'ชาย' : (g === 'female' || g === 'หญิง') ? 'หญิง' : gender;
  };

  const getGenderLabelStyle = (gender) => {
    const g = gender ? gender.toLowerCase() : '';
    if (g === 'male' || g === 'ชาย') return { bg: '#e3f2fd', color: '#1565c0' };
    if (g === 'female' || g === 'หญิง') return { bg: '#fce4ec', color: '#c2185b' };
    return { bg: '#f3e5f5', color: '#7b1fa2' };
  };

  const getGenderAvatar = (gender) => {
    const g = gender ? gender.toLowerCase() : '';
    if (g === 'male' || g === 'ชาย') return maleAvatar;
    if (g === 'female' || g === 'หญิง') return femaleAvatar;
    return null; 
  };

  // --- Filter Logic ---
  const processedPatients = [...patients]
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    .filter(p => {
      const matchCompany = selectedCompany === 'ทั้งหมด' || p.company === selectedCompany;
      const matchUnit = selectedUnit === 'ทั้งหมด' || p.unit === selectedUnit;
      const matchDept = selectedDept === 'ทั้งหมด' || p.department === selectedDept;
      const matchSearch = (p.patientName && p.patientName.toLowerCase().includes(searchTerm.toLowerCase())) || (p.hn_no && p.hn_no.includes(searchTerm));
      return matchCompany && matchUnit && matchDept && matchSearch;
    });

  // ✅ แก้ไขตรงนี้: ลิ้งค์ไปหน้า PatientPage (หน้ากราฟ) โดยใช้ ID
  const handleViewDetail = (id) => {
      console.log("Navigating to detail of ID:", id); 
      navigate(`/patient/${id}`); // ลิ้งค์ไปหน้ากราฟที่เราทำไว้
  };

  return (
    <div style={{ backgroundColor: themeColor, height: '100vh', width: '100vw', display: 'flex', overflow: 'hidden'}}>
      
      {/* Sidebar */}
      <div style={{ width: '85px', flexShrink: 0, position: 'relative', display: 'flex', flexDirection: 'column', zIndex: 20 }}>
        <div style={{ position: 'absolute', top: '40%', width: '100%', transform: 'translateY(-50%)', display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <SidebarItem icon={<Home size={26} />} isActive={false} onClick={() => navigate('/ncdsrisk')} themeColor={themeColor} contentColor={contentColor} />
          <SidebarItem icon={<User size={26} />} isActive={true} onClick={() => {}} themeColor={themeColor} contentColor={contentColor} />
          <SidebarItem icon={<Activity size={26} />} isActive={false} onClick={() => navigate('/risklist')} themeColor={themeColor} contentColor={contentColor} />
        </div>
        <div style={{ position: 'absolute', bottom: '30px', width: '100%' }}>
           <SidebarItem icon={<LogOut size={26} />} onClick={() => navigate('/')} themeColor={themeColor} contentColor={contentColor} />
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '20px 20px 20px 0px' }}>
        <div style={{ backgroundColor: contentColor, width: '100%', height: '100%', borderRadius: '40px', padding: '30px 40px', display: 'flex', flexDirection: 'column', position: 'relative', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>

            {/* Top Bar */}
            <div style={{ display: 'flex', alignItems: 'flex-end', marginBottom: '20px', gap: '20px' }}>
                {/* Filters */}
                <div style={{ display: 'flex', gap: '15px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                        <label style={{ fontWeight: 'bold', fontSize: '15px' }}>บริษัท</label>
                        <div style={{ position: 'relative', width: '250px' }}> 
                            <select value={selectedCompany} onChange={(e) => setSelectedCompany(e.target.value)} style={dropdownStyle}>
                                {companies.map((c, i) => <option key={i} value={c}>{c}</option>)}
                            </select>
                            <ChevronDown size={14} style={chevronStyle} />
                        </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                        <label style={{ fontWeight: 'bold', fontSize: '15px' }}>หน่วยงาน</label>
                        <div style={{ position: 'relative', width: '200px' }}>
                            <select value={selectedUnit} onChange={(e) => setSelectedUnit(e.target.value)} style={dropdownStyle}>
                                {units.map((u, i) => <option key={i} value={u}>{u}</option>)}
                            </select>
                            <ChevronDown size={14} style={chevronStyle} />
                        </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                        <label style={{ fontWeight: 'bold', fontSize: '15px' }}>แผนก</label>
                        <div style={{ position: 'relative', width: '200px' }}>
                            <select value={selectedDept} onChange={(e) => setSelectedDept(e.target.value)} style={dropdownStyle}>
                                {departments.map((d, i) => <option key={i} value={d}>{d}</option>)}
                            </select>
                            <ChevronDown size={14} style={chevronStyle} />
                        </div>
                    </div>
                </div>

                {/* Search */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', flex: 1, alignItems: 'center' }}>
                    <div style={{ width: '100%', maxWidth: '400px' }}>
                        <label style={{ fontWeight: 'bold', fontSize: '15px', display: 'block', marginBottom: '5px', textAlign: 'left' }}>ค้นหา</label>
                        <div style={{ border: '1px solid #ddd', borderRadius: '30px', padding: '8px 15px', display: 'flex', alignItems: 'center', gap: '10px', width: '100%', backgroundColor: '#fff' }}>
                            <Search size={18} color="#999" />
                            <input type="text" placeholder="ค้นหาชื่อ หรือ HN..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ border: 'none', outline: 'none', width: '100%', fontSize: '14px' }} />
                        </div>
                    </div>
                </div>

                {/* Add Button */}
                <div style={{ paddingBottom: '2px' }}>
                    <button onClick={() => alert("ระบบเพิ่มรายชื่อ")} style={{ backgroundColor: themeColor, color: '#fff', border: 'none', borderRadius: '30px', padding: '10px 25px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 'bold', boxShadow: '0 4px 10px rgba(1, 40, 99, 0.3)', whiteSpace: 'nowrap' }}>
                        <Plus size={18} /> เพิ่มรายชื่อ
                    </button>
                </div>
            </div>

            {/* Count */}
            <div style={{ marginBottom: '15px', fontSize: '16px', color: '#555' }}>
                ทั้งหมด {processedPatients.length} คน
            </div>

            {/* Table Header */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 3fr 1.5fr 1fr 1.5fr', padding: '15px 0', color: '#888', fontWeight: 'bold', fontSize: '14px' }}>
                <div>HN</div><div>ชื่อ</div><div>วันเกิด</div><div>เพศ</div><div></div>
            </div>

            {/* Table Body */}
            <div style={{ flex: 1, overflowY: 'auto', paddingRight: '5px' }}>
                {processedPatients.length === 0 ? (
                    <div style={{ textAlign: 'center', marginTop: '20px', color: '#999' }}>ไม่พบข้อมูล</div>
                ) : (
                    processedPatients.map((item, index) => {
                        const genderStyle = getGenderLabelStyle(item.gender);
                        const avatarSrc = getGenderAvatar(item.gender);
                        return (
                            <div key={index} style={{ display: 'grid', gridTemplateColumns: '1.2fr 3fr 1.5fr 1fr 1.5fr', alignItems: 'center', padding: '18px 0', borderBottom: '1px solid #f0f0f0', color: '#333', fontSize: '15px', transition: 'background-color 0.2s' }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9faff'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                                <div style={{ color: '#555', fontWeight: '500' }}>{item.hn_no}</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                    <div style={{ width: '45px', height: '45px', borderRadius: '50%', backgroundColor: genderStyle.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: `2px solid ${genderStyle.bg}` }}>
                                        {avatarSrc ? <img src={avatarSrc} alt={item.gender} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <User size={20} color={genderStyle.color} />}
                                    </div>
                                    <span style={{ color: '#333', fontWeight: '500' }}>{item.patientName}</span>
                                </div>
                                <div style={{ color: '#666' }}>{formatThaiDate(item.dob)}</div>
                                <div><span style={{ backgroundColor: genderStyle.bg, color: genderStyle.color, padding: '4px 12px', borderRadius: '15px', fontSize: '13px', fontWeight: '600' }}>{formatGender(item.gender)}</span></div>
                                <div style={{ textAlign: 'right' }}>
                                    {/* ✅ ส่ง item._id ไปที่ handleViewDetail */}
                                    <button onClick={() => handleViewDetail(item._id)} style={buttonStyle}
                                        onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#3b62d8'; e.currentTarget.style.color = '#fff'; }}
                                        onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#fff'; e.currentTarget.style.color = '#3b62d8'; }}>
                                        <FileText size={14} /> ดูรายละเอียด
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

        </div>
      </div>
    </div>
  );
};

// Styles
const dropdownStyle = { appearance: 'none', width: '100%', border: '1px solid #ddd', borderRadius: '30px', padding: '8px 35px 8px 20px', color: '#333', outline: 'none', cursor: 'pointer', fontSize: '13.5px', backgroundColor: '#fff', whiteSpace: 'nowrap', textOverflow: 'ellipsis' };
const chevronStyle = { position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#888' };
const buttonStyle = { backgroundColor: '#fff', color: '#3b62d8', border: '1px solid #3b62d8', borderRadius: '20px', padding: '6px 15px', display: 'inline-flex', alignItems: 'center', gap: '5px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold', transition: '0.2s' };

const SidebarItem = ({ icon, isActive, onClick, themeColor, contentColor }) => {
    return (
        <div onClick={onClick} style={{ height: '60px', width: '100%', position: 'relative', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: isActive ? contentColor : 'transparent', borderTopLeftRadius: '30px', borderBottomLeftRadius: '30px', marginRight: isActive ? '-1px' : '0', transition: '0.2s' }}>
            {isActive && <div style={{ position: 'absolute', top: '-20px', right: 0, width: '20px', height: '20px', borderRadius: '0 0 20px 0', boxShadow: `5px 5px 0 5px ${contentColor}` }}></div>}
            {isActive && <div style={{ position: 'absolute', bottom: '-20px', right: 0, width: '20px', height: '20px', borderRadius: '0 20px 0 0', boxShadow: `5px -5px 0 5px ${contentColor}` }}></div>}
            <div style={{ position: 'relative', zIndex: 5, color: isActive ? themeColor : '#fff', transform: isActive ? 'scale(1.1)' : 'scale(1)' }}>{icon}</div>
            {isActive && <div style={{ position: 'absolute', right: '-10px', width: '20px', height: '100%', backgroundColor: contentColor, zIndex: 2 }} />}
        </div>
    );
};

export default PatientListPage;