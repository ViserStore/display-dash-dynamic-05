
import React, { useState, useEffect } from 'react';

interface CountdownTimerProps {
  targetDate: string;
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({ targetDate }) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: false
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const target = new Date(targetDate).getTime();
      const difference = target - now;

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeLeft({
          days,
          hours,
          minutes,
          seconds,
          isExpired: false
        });
      } else {
        setTimeLeft({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          isExpired: true
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  const formatTime = () => {
    if (timeLeft.isExpired) {
      return 'Payment Ready';
    }

    if (timeLeft.days > 0) {
      return `${timeLeft.days}d:${timeLeft.hours.toString().padStart(2, '0')}h:${timeLeft.minutes.toString().padStart(2, '0')}m`;
    }

    return `${timeLeft.hours.toString().padStart(2, '0')}h:${timeLeft.minutes.toString().padStart(2, '0')}m:${timeLeft.seconds.toString().padStart(2, '0')}s`;
  };

  return (
    <span className={`font-semibold ${timeLeft.isExpired ? 'text-green-500' : 'text-yellow-500'}`}>
      {formatTime()}
    </span>
  );
};

export default CountdownTimer;
