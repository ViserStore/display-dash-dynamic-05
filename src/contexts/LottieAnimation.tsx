import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { getSupabaseClient } from '@/integrations/supabase/client';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { notify } from '@/utils/notifications';
import { useAuth } from '@/contexts/AuthContext';
import lottie from 'lottie-web';

const BotTrade = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const supabase = getSupabaseClient();

  useEffect(() => {
    if (containerRef.current) {
      const animation = lottie.loadAnimation({
        container: containerRef.current,
        renderer: 'svg',
        loop: true,
        autoplay: true,
        path: '/animation/vvvv.json'
      });

      return () => animation.destroy();
    }
  }, []);

  // Additional bot trading logic would continue here...

  return (
      <div className="" ref={containerRef}></div>
  );
};

export default BotTrade;
