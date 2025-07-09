
import React from 'react';
import { Bell } from 'lucide-react';

const Notifications = () => {
  return (
    <div className="relative min-h-[100vh] bg-black mx-auto max-w-[480px] overflow-y-auto">
      <div className="min-h-[100vh] pt-[0px] pb-[63px]">
        <div className="relative z-[1]">
          {/* Header Section */}
          <div className="relative overflow-hidden">
            <div className="p-[15px] relative z-[2] rounded-b-[30px]">
              <div className="flex gap-3 items-center justify-between">
                <div className="flex gap-2 items-center bg-black/20 border border-gray-500/50 backdrop-blur rounded-full px-[20px] h-[48px]">
                  <Bell className="w-[18px] h-[18px] text-white" />
                  <h1 className="text-white font-bold">Notifications</h1>
                </div>
                <div className="flex gap-2 items-center bg-black/20 border border-gray-500/50 backdrop-blur rounded-full">
                  <img 
                    className="w-[48px] h-[48px] aspect-square border border-gray-500/50 rounded-full" 
                    src="https://img.freepik.com/premium-photo/3d-cartoon-avatar-man-minimal-3d-character_652053-2070.jpg" 
                    alt="" 
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Notifications Content */}
          <div className="p-4">
            <div className="text-center py-16">
              <Bell className="w-16 h-16 text-gray-500 mx-auto mb-4" />
              <h2 className="text-white text-xl font-bold mb-2">No Notifications</h2>
              <p className="text-gray-400">You have no new notifications at the moment.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notifications;
