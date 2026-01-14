import React from 'react';
import { User, Lock, Mail, Phone, Heart } from 'lucide-react';

const RegisterPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white p-10 rounded-[40px] shadow-sm w-full max-w-[400px] flex flex-col items-center">
        
        <div className="flex flex-col items-center mb-6 text-center">
          <Heart className="w-12 h-12 text-green-500 mb-2" />
          <h2 className="text-2xl font-bold text-[#5879D1]">SIGN UP</h2>
          <p className="text-gray-400 text-sm">Enter your information to continue</p>
        </div>

        <div className="w-full space-y-3">
          <div className="relative">
            <span className="absolute inset-y-0 left-4 flex items-center text-blue-500"><User size={20}/></span>
            <input type="text" placeholder="Username" className="w-full pl-12 pr-4 py-3 bg-[#F0F4F8] border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-300" />
          </div>
          <div className="relative">
            <span className="absolute inset-y-0 left-4 flex items-center text-blue-500"><Mail size={20}/></span>
            <input type="email" placeholder="Email" className="w-full pl-12 pr-4 py-3 bg-[#F0F4F8] border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-300" />
          </div>
          <div className="relative">
            <span className="absolute inset-y-0 left-4 flex items-center text-blue-500"><Lock size={20}/></span>
            <input type="password" placeholder="Password" className="w-full pl-12 pr-4 py-3 bg-[#F0F4F8] border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-300" />
          </div>
        </div>

        <button className="w-full py-4 bg-[#0b1d53] hover:bg-[#4AA7C0] text-white text-lg font-semibold rounded-full mt-8 shadow-md active:scale-95">
          Sign up
        </button>

        <p className="mt-4 text-sm text-gray-500">
          Already have an account? <a href="/" className="text-blue-500 font-bold underline">Sign in</a>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;