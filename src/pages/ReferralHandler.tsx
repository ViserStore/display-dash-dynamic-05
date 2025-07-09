
import React, { useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';

const ReferralHandler: React.FC = () => {
  const { referralCode } = useParams<{ referralCode: string }>();

  useEffect(() => {
    if (referralCode) {
      // Store the referral ID in localStorage for use during signup
      localStorage.setItem('referralId', referralCode);
      console.log('Referral ID stored:', referralCode);
    }
  }, [referralCode]);

  // Redirect to signup page after storing referral
  return <Navigate to="/signup" replace />;
};

export default ReferralHandler;
