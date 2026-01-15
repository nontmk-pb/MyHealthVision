//ตัวจัดการการเปลี่ยนหน้า
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './LoginPage';
import RegisterPage from './RegisterPage';
import NcdsPage from './ncdsPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/ncdsrisk" element={<NcdsPage />} />
      </Routes>
    </Router>
  );
}

export default App;