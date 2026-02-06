//ตัวจัดการการเปลี่ยนหน้า
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './LoginPage';
import RegisterPage from './RegisterPage';
import NcdsPage from './ncdsPage';
import PatientListPage from './PatientListPage';
import RiskListPage from './RiskListPage';
import PatientPage from './PatientPage';
import CheckupPage from './CheckupPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/ncdsrisk" element={<NcdsPage />} />
        <Route path="/patientlist" element={<PatientListPage />} />
        <Route path="/risklist" element={<RiskListPage />} />
        <Route path="/patient/:id" element={<PatientPage />} />
      </Routes>
    </Router>
  );
}

export default App;