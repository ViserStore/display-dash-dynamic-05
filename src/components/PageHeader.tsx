
import React from 'react';

interface PageHeaderProps {
  title: string;
  onBackClick?: () => void;
  profileImageUrl?: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({ 
  title, 
  onBackClick,
  profileImageUrl = "https://img.freepik.com/premium-photo/3d-cartoon-avatar-man-minimal-3d-character_652053-2070.jpg"
}) => {
  const handleBackClick = onBackClick || (() => window.history.back());

  return (
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
            <h1 className="text-white font-bold">{title}</h1>
          </div>
          <div className="flex gap-2 items-center bg-black/20 border border-gray-500/50 backdrop-blur rounded-full">
            <img 
              className="w-[48px] h-[48px] aspect-square border border-gray-500/50 rounded-full" 
              src={profileImageUrl} 
              alt="Profile"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PageHeader;
