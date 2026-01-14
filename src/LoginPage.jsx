import React, { useState } from 'react';
import { User, Lock, Eye, Heart } from 'lucide-react';

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      {/* Card Container */}
      <div className="bg-white p-10 rounded-[40px] shadow-sm w-full max-w-[400px] flex flex-col items-center">
        
        {/* Logo Section */}
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

        {/* Input Fields */}
        <div className="w-full space-y-4">
          <div className="relative">
            <span className="absolute inset-y-0 left-4 flex items-center text-blue-500">
              <User size={22} />
            </span>
            <input 
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
              type={showPassword ? "text" : "password"} 
              placeholder="Password" 
              className="w-full pl-12 pr-12 py-4 bg-[#F0F4F8] border-none rounded-2xl text-gray-600 focus:ring-2 focus:ring-blue-300 outline-none"
            />
            <button 
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-4 flex items-center text-blue-400"
            >
              <Eye size={22} />
            </button>
          </div>
        </div>

        {/* Login Button */}
        <button className="w-full py-4 bg-[#0b1d53] hover:bg-[#4AA7C0] text-white text-xl font-semibold rounded-full mt-10 transition-all shadow-md active:scale-95">
          Sign In
        </button>

        {/* Links */}
        <div className="mt-6 flex flex-col items-center gap-2">
          <a href="#" className="text-[#89A8C9] text-sm hover:underline font-medium">Forgot Password?</a>
          <a href="/register" className="text-[#3954a5] text-sm font-bold hover:underline">SIGN UP</a>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;