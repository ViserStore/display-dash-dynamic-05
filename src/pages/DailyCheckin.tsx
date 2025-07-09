
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { notify } from '@/utils/notifications';
import { useAuth } from '@/contexts/AuthContext';
import BottomNavigation from '../components/BottomNavigation';

interface DailyCheckinSetting {
  id: string;
  day_name: string;
  bonus_amount: number;
}

interface UserCheckin {
  id: string;
  checkin_date: string;
  day_name: string;
  bonus_amount: number;
  user_id: string;
  created_at: string;
}

const DailyCheckin = () => {
  const [checkInDays, setCheckInDays] = useState<any[]>([]);
  const [userCheckins, setUserCheckins] = useState<UserCheckin[]>([]);
  const [currencySymbol, setCurrencySymbol] = useState('$');
  const { user } = useAuth();
  
  const handleDrawerToggle = () => {
    const drawer = document.getElementById('drawer-navigation');
    if (drawer) {
      drawer.classList.toggle('-translate-x-full');
    }
  };

  const handleLogout = () => {
    console.log('Logout clicked');
  };

  const handleBackClick = () => {
    window.history.back();
  };

  useEffect(() => {
    console.log('DailyCheckin component mounted, user:', user);
    fetchSiteSettings();
    if (user) {
      console.log('User found, fetching data for user:', user.id);
      fetchDailyCheckinSettings();
      fetchUserCheckins();
    }
  }, [user]);

  const fetchSiteSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('currency_symbol')
        .single();

      if (error) throw error;
      if (data?.currency_symbol) {
        setCurrencySymbol(data.currency_symbol);
      }
    } catch (error) {
      console.error('Error fetching site settings:', error);
    }
  };

  const fetchDailyCheckinSettings = async () => {
    try {
      console.log('Fetching daily check-in settings...');
      const { data, error } = await supabase
        .from('daily_checkin_settings')
        .select('*')
        .order('day_name');

      if (error) {
        console.error('Error fetching settings:', error);
        throw error;
      }

      console.log('Fetched settings:', data);

      if (data) {
        const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        
        // Sort by day order and map database data to display format
        const sortedData = dayOrder.map(day => 
          data.find(setting => setting.day_name === day)
        ).filter(Boolean);

        const mappedData = sortedData.map((setting: DailyCheckinSetting, index) => ({
          day: setting.day_name,
          reward: `+${setting.bonus_amount}`,
          icon: getIconForDay(setting.day_name),
          isToday: isToday(setting.day_name),
          dayIndex: index,
          bonusAmount: setting.bonus_amount,
          isCheckedIn: false, // Will be updated after fetching user check-ins
        }));
        
        console.log('Mapped data:', mappedData);
        setCheckInDays(mappedData);
      }
    } catch (error) {
      console.error('Error fetching daily check-in settings:', error);
      notify.error('Failed to load daily check-in data');
    }
  };

  const fetchUserCheckins = async () => {
    if (!user) {
      console.log('No current user for fetching checkins');
      return;
    }

    try {
      console.log('Fetching user checkins for user:', user.id);
      const { data, error } = await supabase
        .from('user_checkins')
        .select('*')
        .eq('user_id', user.id)
        .order('checkin_date', { ascending: false });

      if (error) {
        console.error('Error fetching user checkins:', error);
        throw error;
      }

      console.log('Fetched user checkins:', data);

      const typedData: UserCheckin[] = (data || []).map(item => ({
        id: item.id,
        checkin_date: item.checkin_date,
        day_name: item.day_name,
        bonus_amount: item.bonus_amount,
        user_id: item.user_id,
        created_at: item.created_at
      }));

      setUserCheckins(typedData);
      updateCheckInStatus(typedData);
    } catch (error) {
      console.error('Error fetching user check-ins:', error);
      notify.error('Failed to load check-in history');
    }
  };

  const updateCheckInStatus = (checkins: UserCheckin[]) => {
    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];
    
    // Check if user has already checked in today
    const todayCheckin = checkins.find(checkin => checkin.checkin_date === today);
    
    setCheckInDays(prev => prev.map((day) => ({
      ...day,
      // User has checked in today if there's a checkin record for today's date
      isCheckedIn: todayCheckin !== undefined,
    })));
  };

  const getIconForDay = (day: string) => {
    const icons: { [key: string]: string } = {
      'Saturday': 'https://cdn-icons-png.flaticon.com/128/6466/6466968.png',
      'Sunday': 'https://cdn-icons-png.flaticon.com/128/3380/3380422.png',
      'Monday': 'https://cdn-icons-png.flaticon.com/128/2822/2822357.png',
      'Tuesday': 'https://cdn-icons-png.flaticon.com/128/4831/4831062.png',
      'Wednesday': 'https://cdn-icons-png.flaticon.com/128/2617/2617484.png',
      'Thursday': 'https://cdn-icons-png.flaticon.com/128/9590/9590150.png',
      'Friday': 'https://cdn-icons-png.flaticon.com/128/2144/2144792.png'
    };
    return icons[day] || 'https://cdn-icons-png.flaticon.com/128/2144/2144792.png';
  };

  const isToday = (day: string) => {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    return today === day;
  };

  const canCheckInToday = () => {
    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];
    
    // Check if user has already checked in today
    const todayCheckin = userCheckins.find(checkin => checkin.checkin_date === today);
    
    // User can check in if they haven't checked in today
    return !todayCheckin;
  };

  const handleDayClick = async (dayIndex: number) => {
    if (!user) {
      notify.error('Please login to check in');
      return;
    }

    const day = checkInDays[dayIndex];
    
    // Only allow check-in for today's day
    if (!day.isToday) {
      notify.error('You can only check in on the current day!');
      return;
    }

    // Check if user can check in today
    if (!canCheckInToday()) {
      notify.info('Already checked in today! Come back tomorrow after 12 AM for your next check-in.');
      return;
    }

    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { error } = await supabase
        .from('user_checkins')
        .insert({
          user_id: user.id,
          checkin_date: today,
          day_name: day.day,
          bonus_amount: day.bonusAmount
        });

      if (error) throw error;

      // Update user's balance
      const { error: balanceError } = await supabase.rpc('add_user_balance', {
        user_id: user.id,
        amount: day.bonusAmount
      });

      if (balanceError) {
        console.error('Error updating balance:', balanceError);
        // Still show success message as the check-in was recorded
      }

      // Create transaction record
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          type: 'daily_checkin',
          amount: day.bonusAmount,
          description: `Daily check-in bonus for ${day.day}`,
          status: 'completed'
        });

      if (transactionError) {
        console.error('Error creating transaction:', transactionError);
      }

      notify.success(`Check-in successful! +${day.bonusAmount} ${currencySymbol} earned`);
      
      // Refresh check-in data
      fetchUserCheckins();
      
    } catch (error: any) {
      console.error('Error checking in:', error);
      
      if (error.code === '23505') { // Unique constraint violation
        notify.error('Already checked in today!');
      } else {
        notify.error('Failed to check in. Please try again.');
      }
    }
  };

  if (!user) {
    return (
      <div className="relative min-h-[100vh] bg-black mx-auto max-w-[480px] overflow-y-hidden">
        <div className="flex justify-center items-center h-64 flex-col gap-4">
          <div className="text-white">Please login to access daily check-in</div>
          <Link to="/login" className="bg-lime-500 text-white px-4 py-2 rounded">Login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-[100vh] bg-black mx-auto max-w-[480px] overflow-y-hidden">
      <div className="min-h-[100vh] pt-[0px] pb-[63px]">
        <div className="relative z-[1]">
         
          {/* Header Section */}
          <div className="relative overflow-hidden mb-[10px]">
            <div className="p-[15px] relative z-[2] rounded-b-[30px]">
              <div className="flex gap-3 items-center justify-between">
                <div className="flex gap-2 items-center bg-black/20 border border-gray-500/50 backdrop-blur rounded-full px-[20px] h-[48px]">
                  <div>
                    <img 
                      className="w-[18px] backBtn cursor-pointer" 
                      src="https://cdn-icons-png.flaticon.com/128/507/507257.png" 
                      alt=""
                      onClick={handleBackClick}
                    />
                  </div>
                  <h1 className="text-white font-bold">Daily Checkin</h1>
                </div>
                <div className="flex gap-2 items-center bg-black/20 border border-gray-500/50 backdrop-blur rounded-full">
                  <img 
                    className="w-[48px] h-[48px] aspect-square border border-gray-500/50 rounded-full" 
                    src="https://img.freepik.com/premium-photo/3d-cartoon-avatar-man-minimal-3d-character_652053-2070.jpg" 
                    alt=""
                    onClick={handleDrawerToggle}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Daily Check-in Grid */}
          <div className="px-2">
            <div className="container rounded-[10px] mx-auto px-[8px] py-[10px]">
              {/* Info text */}
              <div className="text-center mb-4 px-2">
                <p className="text-gray-300 text-sm">
                  {canCheckInToday() 
                    ? "Click on today's card to claim your bonus!" 
                    : "Come back tomorrow after 12 AM for your next check-in!"
                  }
                </p>
              </div>
              
              <div className="grid gap-5 grid-cols-3">
                {checkInDays.map((day, index) => (
                  <div 
                    key={index}
                    className={`flex gap-2 flex-col items-center bg-white/20 backdrop-blur rounded-lg ${
                      day.isToday && canCheckInToday() ? 'cursor-pointer ring-2 ring-orange-400' : ''
                    } ${
                      !canCheckInToday() && day.isToday ? 'ring-2 ring-green-400' : ''
                    } ${
                      !day.isToday ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    onClick={() => {
                      if (day.isToday) {
                        handleDayClick(index);
                      }
                    }}
                  >
                    <div className="bg-white rounded-full w-[75px] h-[75px] mx-2 mt-2 p-1 relative">
                      <img 
                        className="w-[100%] h-[100%] scale-[0.8] p-1" 
                        src={day.icon} 
                        alt="" 
                      />
                      {!canCheckInToday() && day.isToday && (
                        <div className="absolute top-0 right-0 bg-green-500 rounded-full w-4 h-4 flex items-center justify-center">
                          <i className="fi fi-sr-check text-white text-[8px]"></i>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2 items-center">
                      <h1 className="text-[12px] text-gray-200">{day.reward}</h1>
                      {day.isToday && canCheckInToday() && (
                        <i className="fi fi-sr-time-check text-yellow-500 text-[12px] leading-[0px]"></i>
                      )}
                      {!canCheckInToday() && day.isToday && (
                        <i className="fi fi-sr-check-circle text-green-500 text-[12px] leading-[0px]"></i>
                      )}
                    </div>
                    <div className={`w-[100%] rounded-b-[6px] p-1 text-center ${
                      day.isToday && canCheckInToday() ? 'bg-orange-300' : 
                      !canCheckInToday() && day.isToday ? 'bg-green-300' : 
                      'bg-gray-200'
                    }`}>
                      <h1 className="text-[12px] text-gray-700">{day.day}</h1>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          
        </div>
      </div>
    </div>
  );
};

export default DailyCheckin;
