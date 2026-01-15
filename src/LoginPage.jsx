import React, { useState } from 'react';
import { User, Lock, Eye, EyeOff, Heart } from 'lucide-react'; // เพิ่ม EyeOff
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  // State เก็บข้อมูล Login
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ฟังก์ชัน Login
  const handleLogin = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (response.ok) {
        // Login สำเร็จ -> ไปหน้า ncdsPage
        navigate('/ncdsrisk');
      } else {
        // Login ไม่สำเร็จ -> แจ้งเตือนและให้กรอกใหม่
        alert("ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง กรุณากรอกอีกครั้ง");
        setFormData({ ...formData, password: '' }); // ล้างรหัสผ่านเพื่อให้กรอกใหม่ง่ายขึ้น
      }
    } catch (error) {
      console.error("Login Error:", error);
      alert("Server Connection Error");
    }
  };

  // ฟังก์ชัน Forgot Password
  const handleForgotPassword = (e) => {
    e.preventDefault();
    alert("กรุณาลงทะเบียนใหม่อีกครั้ง");
    navigate('/register');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white p-10 rounded-[40px] shadow-sm w-full max-w-[400px] flex flex-col items-center">
        
        <div className="flex flex-col items-center mb-8">
          <div className="relative w-20 h-20 flex items-center justify-center bg-gradient-to-br from-orange-400 via-red-400 to-green-400 rounded-full p-1 shadow-md">
             <div className="bg-white w-full h-full rounded-full flex items-center justify-center">
                <Heart className="w-10 h-10 text-green-500 fill-current" />
             </div>
             <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-white text-3xl font-bold">+</span>
             </div>
          </div>
          <h1 className="text-2xl font-bold text-[#0b1d53] mt-2">MyHealthVision</h1>
          <p className="text-[#5879D1] text-[0.8rem] -mt-1 font-medium">Welcome to MyHealth System</p>
        </div>

        <h2 className="text-2xl font-bold text-[#5879D1] mb-8">SIGN IN</h2>

        <div className="w-full space-y-4">
          <div className="relative">
            <span className="absolute inset-y-0 left-4 flex items-center text-blue-500">
              <User size={22} />
            </span>
            <input 
              name="username"
              onChange={handleChange}
              value={formData.username}
              type="text" 
              placeholder="Username" 
              className="w-full pl-12 pr-4 py-4 bg-[#F0F4F8] border-none rounded-2xl text-gray-600 focus:ring-2 focus:ring-blue-300 outline-none"
            />
          </div>

          <div className="relative">
            <span className="absolute inset-y-0 left-4 flex items-center text-blue-500">
              <Lock size={22} />
            </span>
            <input 
              name="password"
              onChange={handleChange}
              value={formData.password}
              type={showPassword ? "text" : "password"} 
              placeholder="Password" 
              className="w-full pl-12 pr-12 py-4 bg-[#F0F4F8] border-none rounded-2xl text-gray-600 focus:ring-2 focus:ring-blue-300 outline-none"
            />
            <button 
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-4 flex items-center text-blue-400"
            >
              {/* ถ้าซ่อนรหัส (password) = รูปปิดตา (EyeOff) / ถ้าแสดงรหัส (text) = รูปเปิดตา (Eye) */}
              {showPassword ? <Eye size={22} /> : <EyeOff size={22} />}
            </button>
          </div>
        </div>

        <button 
          onClick={handleLogin}
          className="w-full py-4 bg-[#0b1d53] hover:bg-[#4AA7C0] text-white text-xl font-semibold rounded-full mt-10 transition-all shadow-md active:scale-95">
          Sign In
        </button>

        <div className="mt-6 flex flex-col items-center gap-2">
          <a href="#" onClick={handleForgotPassword} className="text-[#89A8C9] text-sm hover:underline font-medium">Forgot Password?</a>
          <a href="/register" className="text-[#3954a5] text-sm font-bold hover:underline">SIGN UP</a>
        </div>
      </div>
    </div>
  );
};
export default LoginPage;