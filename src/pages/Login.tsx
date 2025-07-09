
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate, useLocation, Link, useNavigate } from 'react-router-dom';
import { notify } from '@/utils/notifications';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { signIn, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // If user is already logged in, redirect them to home
  useEffect(() => {
    if (user) {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!username || !password) {
      notify.error('Please fill in all fields');
      setLoading(false);
      return;
    }

    try {
      const { error } = await signIn(username, password);
      
      if (error) {
        notify.error(error.message);
      } else {
        notify.success('Login successful!');
        // Always redirect to home page after successful login
        navigate('/', { replace: true });
      }
    } catch (err) {
      console.error('Login submission error:', err);
      notify.error('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // If user is already authenticated, redirect to home
  if (user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="relative min-h-[100vh] bg-black mx-auto max-w-[480px]">
      <img 
        className="animated-btc drop-shadow-btc _absolute_lq8ol_346 top-[30px] right-[30px] w-[80px] h-[80px] opacity-80" 
        src="https://static.vecteezy.com/system/resources/previews/024/092/705/non_2x/bitcoin-btc-glass-crypto-coin-3d-illustration-free-png.png" 
        alt=""
      />
      <img 
        className="animated-usdt drop-shadow-usdt _absolute_lq8ol_346 top-[24%] left-[30px] _w-[60px]_lq8ol_389 _h-[60px]_lq8ol_395 opacity-80" 
        src="https://static.vecteezy.com/system/resources/previews/024/093/409/non_2x/tether-usdt-glass-crypto-coin-3d-illustration-free-png.png" 
        alt=""
      />
      <img 
        className="animated-trx drop-shadow-trx _absolute_lq8ol_346 bottom-[15%] right-[30px] w-[40px] h-[40px] opacity-80" 
        src="https://static.vecteezy.com/system/resources/previews/024/093/392/non_2x/tron-trx-glass-crypto-coin-3d-illustration-free-png.png" 
        alt=""
      />
      
      <div className="mb-10 pt-[20%]">
        <img 
          className="_mx-auto_lq8ol_1 _h-[100px]_lq8ol_609 drop-shadow-logo _w-auto_lq8ol_403" 
          src="https://tradebull.scriptbasket.com/logo/logo.png" 
          alt="Your Company"
        />
        <h1 className="mt-4 text-[24px] _font-bold_lq8ol_110 _text-white_lq8ol_196 _text-center_lq8ol_102 drop-shadow-lg text-nowrap">
          Welcome To TradeBull
        </h1>
        <h1 className="_text-[14px]_lq8ol_407 _text-white_lq8ol_196 _font-bold_lq8ol_110 _text-center_lq8ol_102 uppercase">
          After login you can Trade.
        </h1>
      </div>
      
      <div className="_px-4_lq8ol_425 pt-7">
        <form onSubmit={handleSubmit}>
          <div className="relative">
            <label 
              htmlFor="username" 
              className="block mb-2 text-sm font-medium text-gray-200 text-lime-500 absolute left-[20px] top-[-10px] z-[1] px-2 bg-black uppercase"
            >
              username
            </label>
            <div className="relative mb-3">
              <div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none">
                <i className="fi fi-rr-user _text-gray-400_lq8ol_587 _leading-[0px]_lq8ol_306"></i>
              </div>
              <input 
                className="placeholder:text-gray-400 !text-lime-500 border-[1.5px] !border-lime-500 py-[17px] !rounded-[10px] !bg-transparent autofill:bg-autofillBg bg-transparent border hover:border-lime-500 focus:border-lime-500 focus:outline-0 text-gray-200 focus:text-gray-200 text-sm rounded-md focus:ring-rose-500 block w-full ps-10 p-2.5" 
                type="text" 
                placeholder="enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
          </div>
          
          <div className="relative">
            <label 
              htmlFor="password" 
              className="block mb-2 text-sm font-medium text-gray-200 text-lime-500 absolute left-[20px] top-[-10px] z-[1] px-2 bg-black uppercase"
            >
              password
            </label>
            <div className="relative mb-3">
              <div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none">
                <i className="fi fi-rr-lock _text-gray-400_lq8ol_587 _leading-[0px]_lq8ol_306"></i>
              </div>
              <input 
                className="placeholder:text-gray-400 !text-lime-500 border-[1.5px] !border-lime-500 py-[17px] !rounded-[10px] !bg-transparent autofill:bg-autofillBg bg-transparent border hover:border-lime-500 focus:border-lime-500 focus:outline-0 text-gray-200 focus:text-gray-200 text-sm rounded-md focus:ring-rose-500 block w-full ps-10 p-2.5" 
                type="password" 
                placeholder="enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>
          
          <div className="_flex_lq8ol_19 _justify-center_lq8ol_106">
            <button 
              type="submit" 
              disabled={loading}
              className={`${
                loading 
                  ? 'bg-gradient-to-r from-lime-600 to-lime-500 cursor-not-allowed' 
                  : 'bg-gradient-to-r hover:bg-gradient-to-l from-lime-500 hover:from-lime-600 to-lime-400 hover:to-lime-500'
              } text-white w-[100%] p-2 rounded-[10px] relative z-[2] mt-5 font-bold w-[75%] py-[15px] rounded-[10px] transition-all duration-200`}
            >
              {loading ? (
                <span className="loading loading-bars loading-xs -mb-1"></span>
              ) : (
                'Sign In'
              )}
            </button>
          </div>
        </form>
        
        <p className="mt-4 _text-center_lq8ol_102 _text-sm_lq8ol_214 _text-gray-400_lq8ol_587">
          Not a member?
          <Link className="_font-semibold_lq8ol_73 leading-6 text-lime-600 hover:text-lime-500 ps-1" to="/signup">
            Signup Now
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
