
import React from 'react';

interface TimeProfitSetting {
  time_hours: number;
  profit_percentage: number;
}

interface TimeProfitSettingsProps {
  settings: TimeProfitSetting[];
  selectedTimer?: number;
  onTimerSelect?: (hours: number) => void;
}

const TimeProfitSettings: React.FC<TimeProfitSettingsProps> = ({ 
  settings, 
  selectedTimer, 
  onTimerSelect 
}) => {
  return (
    <div className="bg-gray-700/20 backdrop-blur rounded-lg p-4 mb-4">
      <h3 className="text-white font-semibold text-sm mb-3">Time & Profit Settings</h3>
      <div className="grid grid-cols-2 gap-2">
        {settings.map((setting) => (
          <div
            key={setting.time_hours}
            className={`p-3 rounded-lg border cursor-pointer transition-colors ${
              selectedTimer === setting.time_hours
                ? 'bg-lime-500/20 border-lime-500 text-lime-300'
                : 'bg-gray-800/30 border-gray-600 text-gray-300 hover:bg-gray-700/40'
            }`}
            onClick={() => onTimerSelect?.(setting.time_hours)}
          >
            <div className="text-center">
              <div className="text-lg font-bold">
                {setting.time_hours}H
              </div>
              <div className="text-xs opacity-80">
                {setting.profit_percentage}% profit
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TimeProfitSettings;
