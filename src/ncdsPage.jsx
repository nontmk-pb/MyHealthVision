import React from 'react';

const NcdsPage = () => {
  console.log("✅ NcdsPage Loaded!"); // เช็คใน Console ว่าเข้ามาหน้านี้ไหม

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0b1d53]">
      <h1 className="text-white text-6xl font-bold">
        MyHealthVision
      </h1>
      <p className="text-xl mt-4 text-white">
        Welcome to MyHealth NCDsRisk System
      </p>
    </div>
  );
};

//className1 : bg-[#0b1d53]

export default NcdsPage;  // <--- บรรทัดนี้ห้ามลืมเด็ดขาด!