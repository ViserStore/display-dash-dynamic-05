
import { Link, useLocation } from 'react-router-dom';

const BottomNavigation = () => {
  const location = useLocation();
  
  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="btm-nav bottomnav-user bg-black z-[5] shadow-none _max-w-[480px]_lq8ol_314 _mx-auto_lq8ol_1">
      <Link className={`imgBottom ${isActive('/') ? 'text-primary imgActive' : 'text-gray-500'}`} to="/">
        <img className="w-[25px] invert" src="https://i.ibb.co/0pB2rKmM/951c0ec0-2706-44f3-8cfd-ca0ab5c0da08.png" alt="" />
        <span className="btm-nav-label text-[9px]">Home</span>
      </Link>
      <Link className={`imgBottom ${isActive('/market') ? 'text-primary imgActive' : 'text-gray-500'}`} to="/market">
        <img className="w-[25px] invert" src="https://i.ibb.co/9mKCBq5d/0770f71d-c4eb-4091-bf63-6d58034d0eeb.png" alt="" />
        <span className="btm-nav-label text-[9px]">Market</span>
      </Link>
      <Link className={`bg-transparent border-t-0 group ${isActive('/trading') ? 'active' : ''}`} to="/trading">
        <div className={`w-[46px] h-[46px] flex justify-center items-center rotate-45 ${isActive('/trading') ? 'bg-lime-500' : 'bg-white group-hover:bg-lime-500'} group-[.active]:bg-lime-500 rounded-[13px] mt-[-30px] p-[8px]`}>
          <img className="_w-[100%]_lq8ol_371 -rotate-45" src="https://i.ibb.co/7d7v4qkL/d3178b1d-5c55-4c0a-b18e-3f371e3a5258.png" alt="" />
        </div>
      </Link>
      <Link className={`imgBottom ${isActive('/orders') ? 'text-primary imgActive' : 'text-gray-500'}`} to="/orders">
        <img className="w-[25px] invert" src="https://i.ibb.co/YBz5FNhw/74373231-a4b4-4d5c-b72c-0a5f94dcfb18.png" alt="" />
        <span className="btm-nav-label text-[9px]">Records</span>
      </Link>
      <Link className={`imgBottom ${isActive('/wallet') ? 'text-primary imgActive' : 'text-gray-500'}`} to="/wallet">
        <img className="w-[25px] invert" src="https://i.ibb.co/7d7v4qkL/d3178b1d-5c55-4c0a-b18e-3f371e3a5258.png" alt="" />
        <span className="btm-nav-label text-[9px]">Wallet</span>
      </Link>
    </div>
  );
};

export default BottomNavigation;
