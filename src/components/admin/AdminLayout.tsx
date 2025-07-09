
import React from 'react';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAppInfo } from '@/hooks/useAppInfo';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { signOut } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { appInfo, loading: appInfoLoading } = useAppInfo();

  const handleLogout = async () => {
    await signOut();
    navigate('/admin/login');
  };

  const handleSidebarToggle = () => {
    const sidebar = document.getElementById('logo-sidebar');
    if (sidebar) {
      sidebar.classList.toggle('-translate-x-full');
    }
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const getMenuItemClasses = (path: string) => {
    return isActive(path)
      ? "flex items-center p-2 rounded-lg text-rose-500 group bg-rose-600 text-white"
      : "flex items-center p-2 rounded-lg text-rose-500 group bg-rose-100 hover:bg-rose-200";
  };

  // Provide fallback values when appInfo is null
  const appLogo = appInfo?.logo || "https://tradebull.scriptbasket.com/logo/logo.png";
  const appName = appInfo?.name || "TradeBull";
  const appWebsite = appInfo?.website || "https://tradebull.com";
  const appVersion = appInfo?.version || "1.0";

  return (
    <div className="pt-[47px] pb-1 min-h-screen bg-rose-50">
      {/* Header */}
      <nav className="fixed top-0 z-50 w-full bg-white border-b border-gray-200">
        <div className="px-3 py-3 lg:px-5 lg:pl-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center justify-start rtl:justify-end">
              <button 
                onClick={handleSidebarToggle}
                data-drawer-target="logo-sidebar" 
                data-drawer-toggle="logo-sidebar" 
                aria-controls="logo-sidebar" 
                type="button" 
                className="inline-flex items-center p-2 text-sm text-gray-500 rounded-lg sm:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200"
              >
                <span className="sr-only">Open sidebar</span>
                <i className="fi fi-br-bars-staggered text-rose-700 leading-[0px] text-[20px]"></i>
              </button>
              <Link className="flex ms-2 md:me-24" to="/admin/dashboard">
                <img src={appLogo} className="h-8 me-3" alt="Site Logo" />
                <span className="self-center text-xl font-semibold sm:text-2xl whitespace-nowrap text-rose-500">{appName}</span>
              </Link>
            </div>
            <div className="flex items-center">
              <a className="bg-rose-700 p-2 rounded-full flex gap-2 items-center" href={appWebsite} target="_blank">
                <i className="fi fi-sr-globe leading-[0px] text-white"></i>
                <h1 className="text-[12px] text-white hidden lg:block">Visit Site</h1>
              </a>
              <div className="flex items-center ms-3">
                <div>
                  <Link className="flex text-sm bg-gray-800 rounded-full focus:ring-4 focus:ring-gray-300 dark:focus:ring-gray-600" aria-expanded="false" data-dropdown-toggle="dropdown-user" to="/admin/profile-setting">
                    <span className="sr-only">Open user menu</span>
                    <img className="w-8 h-8 rounded-full" src="https://cdn-icons-png.flaticon.com/128/1144/1144709.png" alt="user photo" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Sidebar */}
      <aside id="logo-sidebar" className="fixed top-0 left-0 z-40 w-64 h-screen pt-[65px] transition-transform -translate-x-full bg-white border-r border-gray-200 sm:translate-x-0" aria-label="Sidebar">
        <div className="h-full px-3 pb-4 overflow-y-auto bg-white">
          <div className="py-4 overflow-y-auto">
            <ul className="space-y-2 font-medium mb-6">
              <li className="!mt-3">
                <h1 className="text-rose-300">Menu</h1>
              </li>
              <li>
                <Link 
                  className={getMenuItemClasses('/admin/dashboard')} 
                  to="/admin/dashboard"
                  {...(isActive('/admin/dashboard') && { 'aria-current': 'page' })}
                >
                  <i className="fi fi-ss-apps leading-[0px]"></i>
                  <span className="ms-3">Dashboard</span>
                </Link>
              </li>
              <li>
                <Link className={getMenuItemClasses('/admin/banners')} to="/admin/banners">
                  <i className="fi fi-ss-ad leading-[0px]"></i>
                  <span className="ms-3">Manage Banners</span>
                </Link>
              </li>
              <li>
                <Link 
                  className={getMenuItemClasses('/admin/users')} 
                  to="/admin/users"
                  {...(isActive('/admin/users') && { 'aria-current': 'page' })}
                >
                  <i className="fi fi-ss-users leading-[0px]"></i>
                  <span className="ms-3">Manage Users</span>
                </Link>
              </li>
              <li>
                <Link className={getMenuItemClasses('/admin/kyc/pending-data')} to="/admin/kyc/pending-data">
                  <i className="fi fi-ss-box-circle-check leading-[0px]"></i>
                  <span className="ms-3">Pending Kyc Data</span>
                </Link>
              </li>
              <li>
                <Link className={getMenuItemClasses('/admin/referral-setting')} to="/admin/referral-setting">
                  <i className="fi fi-ss-users-alt leading-[0px]"></i>
                  <span className="ms-3">Referral Setting</span>
                </Link>
              </li>
              <li>
                <Link className={getMenuItemClasses('/admin/coins')} to="/admin/coins">
                  <i className="fi fi-ss-coins leading-[0px]"></i>
                  <span className="ms-3">Manage Coins</span>
                </Link>
              </li>
              <li>
                <Link className={getMenuItemClasses('/admin/nfts')} to="/admin/nfts">
                  <i className="fi fi-ss-graphic-style leading-[0px]"></i>
                  <span className="ms-3">Manage NFTs</span>
                </Link>
              </li>
              <li>
                <Link className={getMenuItemClasses('/admin/trade-setting')} to="/admin/trade-setting">
                  <i className="fi fi-ss-stats leading-[0px]"></i>
                  <span className="ms-3">Trade Setting</span>
                </Link>
              </li>
              <li className="!mt-3">
                <h1 className="text-rose-300">Gateways</h1>
              </li>
              <li>
                <Link className={getMenuItemClasses('/admin/deposit/methods')} to="/admin/deposit/methods">
                  <i className="fi fi-ss-coin leading-[0px]"></i>
                  <span className="ms-3">Deposit Methods</span>
                </Link>
              </li>
              <li>
                <Link className={getMenuItemClasses('/admin/withdraw/methods')} to="/admin/withdraw/methods">
                  <i className="fi fi-ss-wallet leading-[0px]"></i>
                  <span className="ms-3">Withdraw Methods</span>
                </Link>
              </li>
              <li className="!mt-3">
                <h1 className="text-rose-300">Logs</h1>
              </li>
              <li>
                <Link className={getMenuItemClasses('/admin/deposit/logs')} to="/admin/deposit/logs">
                  <i className="fi fi-ss-file-medical-alt leading-[0px]"></i>
                  <span className="ms-3">Deposit Logs</span>
                </Link>
              </li>
              <li>
                <Link className={getMenuItemClasses('/admin/withdraw/logs')} to="/admin/withdraw/logs">
                  <i className="fi fi-ss-file-medical-alt leading-[0px]"></i>
                  <span className="ms-3">Withdraw Logs</span>
                </Link>
              </li>
              <li>
                <Link className={getMenuItemClasses('/admin/nft-invests')} to="/admin/nft-invests">
                  <i className="fi fi-ss-bulb leading-[0px]"></i>
                  <span className="ms-3">NFT Invests</span>
                </Link>
              </li>
              <li>
                <Link className={getMenuItemClasses('/admin/transactions')} to="/admin/transactions">
                  <i className="fi fi-ss-newspaper leading-[0px]"></i>
                  <span className="ms-3">Transactions</span>
                </Link>
              </li>
              <li>
                <Link className={getMenuItemClasses('/admin/transfer-logs')} to="/admin/transfer-logs">
                  <i className="fi fi-ss-exchange leading-[0px]"></i>
                  <span className="ms-3">Transfer Logs</span>
                </Link>
              </li>
              <li className="!mt-3">
                <h1 className="text-rose-300">Settings</h1>
              </li>
              <li>
                <Link className={getMenuItemClasses('/admin/setting')} to="/admin/setting">
                  <i className="fi fi-ss-settings leading-[0px]"></i>
                  <span className="ms-3">Site Settings</span>
                </Link>
              </li>
              <li>
                <Link className={getMenuItemClasses('/admin/daily-checkin-setup')} to="/admin/daily-checkin-setup">
                  <i className="fi fi-ss-list-check leading-[0px]"></i>
                  <span className="ms-3">Check-In Settings</span>
                </Link>
              </li>
              <li>
                <Link className={getMenuItemClasses('/admin/app-settings')} to="/admin/app-settings">
                  <i className="fi fi-ss-settings leading-[0px]"></i>
                  <span className="ms-3">App Settings</span>
                </Link>
              </li>
              <li>
                <Link className={getMenuItemClasses('/admin/notice')} to="/admin/notice">
                  <i className="fi fi-ss-bell leading-[0px]"></i>
                  <span className="ms-3">Notice Setup</span>
                </Link>
              </li>
              <li>
                <Link className={getMenuItemClasses('/admin/contact-details')} to="/admin/contact-details">
                  <i className="fi fi-ss-customer-service leading-[0px]"></i>
                  <span className="ms-3">Contact Details Setup</span>
                </Link>
              </li>
              <li>
                <div className="flex items-center p-2 rounded-lg text-rose-500 hover:bg-rose-200 bg-rose-100 group cursor-pointer" onClick={handleLogout}>
                  <i className="fi fi-ss-power leading-[0px]"></i>
                  <span className="ms-3">Logout</span>
                </div>
              </li>
            </ul>
          </div>
        </div>
        <div className="absolute bottom-[15px] w-[100%] bg-white">
          <div className="flex">
            <a 
              href={appWebsite} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-rose-400 text-[15px] text-center w-[100%] hover:text-rose-600 transition-colors cursor-pointer"
            >
              Version {appVersion} © {appName}
            </a>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="p-4 sm:ml-64 bg-rose-50 min-h-screen">
        {children}
      </div>
    </div>
  );
};

export default AdminLayout;
