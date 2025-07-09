import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import BottomNavigation from '../components/BottomNavigation';
import PageHeader from '../components/PageHeader';

const KycSettings = () => {
  const { user } = useAuth();

  const handleLogout = () => {
    console.log('Logout clicked');
  };

  return (
    <>
      
      <div className="relative min-h-[100vh] bg-black mx-auto max-w-[480px] overflow-y-hidden">
        <div className="min-h-[100vh] pt-[0px] pb-[63px]">
          <div className="relative z-[1]">
           
            <PageHeader title="KYC" />

            {/* KYC Content */}
            <div className="container mx-auto px-[8px] backdrop-blur overflow-auto h-[calc(100vh-154px)] pt-[12px]">
              <div className="flex flex-col items-center">
                <img 
                  src="https://cdn-icons-png.flaticon.com/128/12902/12902047.png" 
                  alt="" 
                  className="w-[100px] h-[100px] hue-rotate-[238deg]"
                />
                <h1 className="text-[25px] font-bold text-center mt-3 text-lime-400">
                  KYC Informations Verified Successfully!
                </h1>
              </div>
            </div>

            
          </div>
        </div>
      </div>
    </>
  );
};

export default KycSettings;
