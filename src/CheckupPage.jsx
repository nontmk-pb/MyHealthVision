import React, { useState, useEffect, useMemo } from 'react';
import { Home, User, Activity, LogOut, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// --- Import รูปภาพ ---
import maleAvatar from "./assets/male_avatar.png";
import femaleAvatar from "./assets/female_avatar.png";

const API_BASE_URL = 'http://localhost:5001/api';

const CheckupPage = () => {
  const navigate = useNavigate();
  const themeColor = '#1f0177';

  // --- States ---
  const [patients, setPatients] = useState([]);

  
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
        <div style={{ backgroundColor: '#f0f2f5', width: '100%', height: '100%', borderRadius: '40px', padding: '20px 30px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}></div>
     </div>
    </div>
  );
};

const SidebarItem = ({ icon, isActive, onClick, themeColor }) => (
    <div onClick={onClick} style={{ height: '60px', width: '100%', position: 'relative', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: isActive ? '#f0f2f5' : 'transparent', borderTopLeftRadius: '30px', borderBottomLeftRadius: '30px', transition: 'all 0.2s', marginRight: isActive ? '-1px' : '0' }}>
      {isActive && <div style={{ position: 'absolute', top: '-20px', right: '0', width: '20px', height: '20px', boxShadow: `5px 5px 0 5px #f0f2f5`, borderBottomRightRadius: '20px' }}></div>}
      <div style={{ position: 'relative', zIndex: 5, color: isActive ? themeColor : '#ffffff', transform: isActive ? 'scale(1.1)' : 'scale(1)' }}>{icon}</div>
      {isActive && <div style={{ position: 'absolute', bottom: '-20px', right: '0', width: '20px', height: '20px', boxShadow: `5px -5px 0 5px #f0f2f5`, borderTopRightRadius: '20px' }}></div>}
    </div>
);

export default CheckupPage;