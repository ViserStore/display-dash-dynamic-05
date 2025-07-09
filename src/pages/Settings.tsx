
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import BottomNavigation from '../components/BottomNavigation';

const Settings = () => {
  const { signOut } = useAuth();

  const handleBackClick = () => {
    window.history.back();
  };

  const handleLogout = async () => {
    try {
      await signOut();
      // Redirect will happen automatically through the auth context
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="relative min-h-[100vh] bg-black mx-auto max-w-[480px] overflow-y-hidden">
      <div className="min-h-[100vh] pt-[0px] pb-[63px]">
        <div className="relative z-[1]">
          
          
          {/* Header */}
          <div className="relative overflow-hidden mb-[10px]">
            <div className="p-[15px] relative z-[2] rounded-b-[30px]">
              <div className="flex gap-3 items-center justify-between">
                <div className="flex gap-2 items-center bg-black/20 border border-gray-500/50 backdrop-blur rounded-full px-[20px] h-[48px]">
                  <div>
                    <img 
                      className="w-[18px] backBtn cursor-pointer" 
                      src="https://cdn-icons-png.flaticon.com/128/507/507257.png" 
                      alt="Back"
                      onClick={handleBackClick}
                    />
                  </div>
                  <h1 className="text-white font-bold">App Settings</h1>
                </div>
                <div className="flex gap-2 items-center bg-black/20 border border-gray-500/50 backdrop-blur rounded-full">
                  <img 
                    className="w-[48px] h-[48px] aspect-square border border-gray-500/50 rounded-full" 
                    src="https://img.freepik.com/premium-photo/3d-cartoon-avatar-man-minimal-3d-character_652053-2070.jpg" 
                    alt="Profile"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Settings Content */}
          <div className="h-[calc(100vh-153px)] overflow-auto">
            <div className="px-[6px]">
              <h1 className="text-[14px] text-gray-500 mb-2">General</h1>
              
              <Link className="flex items-center gap-2 text-gray-200 hover:text-lime-500 px-2 font-semibold text-[16px] py-3 mb-2" to="/settings/profile">
                <h1 className="flex-auto">Profile Setting</h1>
                <i className="fi fi-sr-angle-right text-[12px] leading-[0px]"></i>
              </Link>
              
              <Link className="flex items-center gap-2 text-gray-200 hover:text-lime-500 px-2 font-semibold text-[16px] py-3 mb-2" to="/settings/password">
                <h1 className="flex-auto">Password Change</h1>
                <i className="fi fi-sr-angle-right text-[12px] leading-[0px]"></i>
              </Link>
              
              <Link className="flex items-center gap-2 text-gray-200 hover:text-lime-500 px-2 font-semibold text-[16px] py-3 mb-2" to="/settings/kyc">
                <h1 className="flex-auto">KYC Setting</h1>
                <i className="fi fi-sr-angle-right text-[12px] leading-[0px]"></i>
              </Link>
              
              <Link className="flex items-center gap-2 text-gray-200 hover:text-lime-500 px-2 font-semibold text-[16px] py-3 mb-2" to="/withdraw/pin">
                <h1 className="flex-auto">Withdraw Pin</h1>
                <i className="fi fi-sr-angle-right text-[12px] leading-[0px]"></i>
              </Link>
            </div>

            <div className="px-[6px] mt-7">
              <h1 className="text-[14px] text-gray-500 mb-2">Others</h1>
              
              <Link className="flex items-center gap-2 text-gray-200 hover:text-lime-500 px-2 font-semibold text-[16px] py-3 mb-2" to="/help-and-support">
                <h1 className="flex-auto">Help & Support</h1>
                <i className="fi fi-sr-angle-right text-[12px] leading-[0px]"></i>
              </Link>
              
              <div 
                className="flex items-center gap-2 text-gray-200 hover:text-rose-500 px-2 font-semibold text-[16px] py-3 mb-2 cursor-pointer"
                onClick={handleLogout}
              >
                <h1 className="flex-auto">Log Out</h1>
                <i className="fi fi-sr-angle-right text-[12px] leading-[0px]"></i>
              </div>
            </div>
          </div>

          
        </div>
      </div>
    </div>
  );
};

export default Settings;
