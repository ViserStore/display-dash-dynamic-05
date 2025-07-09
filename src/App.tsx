import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/utils/notifications";
import { AuthProvider } from "./contexts/AuthContext";
import { AdminAuthProvider } from "./contexts/AdminAuthContext";
import { AnimationProvider } from "./contexts/AnimationContext";
import BottomNavigation from "./components/BottomNavigation";

import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Market from "./pages/Market";
import Trading from "./pages/Trading";
import Swap from "./pages/Swap";
import Orders from "./pages/Orders";
import OrdersAll from "./pages/OrdersAll";
import OrdersRunning from "./pages/OrdersRunning";
import OrdersCompleted from "./pages/OrdersCompleted";
import Wallet from "./pages/Wallet";
import Settings from "./pages/Settings";
import ProfileSettings from "./pages/ProfileSettings";
import KycSettings from "./pages/KycSettings";
import PasswordChange from "./pages/PasswordChange";
import Deposit from "./pages/Deposit";
import DepositDetail from "./pages/DepositDetail";
import DepositPending from "./pages/DepositPending";
import Withdraw from "./pages/Withdraw";
import WithdrawDetail from "./pages/WithdrawDetail";
import WithdrawPending from "./pages/WithdrawPending";
import WithdrawPin from "./pages/WithdrawPin";
import Transactions from "./pages/Transactions";
import DepositLogs from "./pages/DepositLogs";
import WithdrawLogs from "./pages/WithdrawLogs";
import TransferLogs from "./pages/TransferLogs";
import Referral from "./pages/Referral";
import ReferralHandler from "./pages/ReferralHandler";
import Nfts from "./pages/AllNfts";
import NftDetails from "./pages/NftDetails";
import NftInvests from "./pages/NftInvests";
import AllTools from "./pages/AllTools";
import DailyCheckin from "./pages/DailyCheckin";
import Leaderboard from "./pages/Leaderboard";
import AboutUs from "./pages/AboutUs";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import HelpAndSupport from "./pages/HelpAndSupport";
import AppDownload from "./pages/AppDownload";
import NotFound from "./pages/NotFound";
import BalanceTransfer from "./pages/BalanceTransfer";
import BotTrade from "./pages/BotTrade";
import BotTradeDetails from "./pages/BotTradeDetails";
import Commissions from "./pages/Commissions";

import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminUserDetail from "./pages/admin/AdminUserDetail";
import AdminCoins from "./pages/admin/AdminCoins";
import AdminNfts from "./pages/admin/AdminNfts";
import AdminBanners from "./pages/admin/AdminBanners";
import AdminDepositMethods from "./pages/admin/AdminDepositMethods";
import AdminDepositMethodAdd from "./pages/admin/AdminDepositMethodAdd";
import AdminDepositMethodEdit from "./pages/admin/AdminDepositMethodEdit";
import AdminWithdrawMethods from "./pages/admin/AdminWithdrawMethods";
import AdminWithdrawMethodAdd from "./pages/admin/AdminWithdrawMethodAdd";
import AdminWithdrawMethodEdit from "./pages/admin/AdminWithdrawMethodEdit";
import AdminPendingDeposits from "./pages/admin/AdminPendingDeposits";
import AdminPendingWithdrawals from "./pages/admin/AdminPendingWithdrawals";
import AdminPendingKyc from "./pages/admin/AdminPendingKyc";
import AdminDepositLogs from "./pages/admin/AdminDepositLogs";
import AdminWithdrawLogs from "./pages/admin/AdminWithdrawLogs";
import AdminTransferLogs from "./pages/admin/AdminTransferLogs";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminAppSettings from "./pages/admin/AdminAppSettings";
import AdminContactDetails from "./pages/admin/AdminContactDetails";
import AdminNoticeSetup from "./pages/admin/AdminNoticeSetup";
import AdminDailyCheckinSetup from "./pages/admin/AdminDailyCheckinSetup";
import AdminReferralSetting from "./pages/admin/AdminReferralSetting";
import AdminTradeSetting from "./pages/admin/AdminTradeSetting";
import AdminProfileSettings from "./pages/admin/AdminProfileSettings";
import AdminTransactions from "./pages/admin/AdminTransactions";
import AdminNftInvests from "./pages/admin/AdminNftInvests";

import Maintenance from "./pages/Maintenance";

import ProtectedRoute from "./components/ProtectedRoute";
import AdminProtectedRoute from "./components/AdminProtectedRoute";
import { TooltipProvider } from "@/components/ui/tooltip";
import { UserDataProvider } from '@/contexts/UserDataContext';

const queryClient = new QueryClient();

const ConditionalBottomNavigation = () => {
  const location = useLocation();
  
  const hideBottomNavPages = [
    '/login',
    '/signup',
    '*', // Hide bottom nav on 404 page
  ];
  
  const isAdminPage = location.pathname.startsWith('/admin');
  
  const isReferralHandler = location.pathname.includes('/referral/') || location.pathname.includes('/signup/');
  
  // Check if current path matches any 404 pattern (any unmatched route)
  const is404Page = !location.pathname.match(/^\/(login|signup|market|markets|trading|swap|bot-trade|orders|wallet|wallets|balance-transfer|settings|deposit|withdraw|transactions|commission|commissions|referral|nfts|all-nfts|nft|nft-details|nft-invests|tools|all-tools|daily-checkin|leaderboard|about-us|privacy-policy|help-and-support|app-download|admin)($|\/)/);
  
  const shouldHideBottomNav = hideBottomNavPages.includes(location.pathname) || isAdminPage || isReferralHandler || (location.pathname !== '/' && is404Page);
  
  if (shouldHideBottomNav) {
    return null;
  }
  
  return <BottomNavigation />;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <UserDataProvider>
            <AdminAuthProvider>
              <AnimationProvider>
                <div className="min-h-screen bg-background font-sans antialiased">
                  <Toaster />
                  <Routes>
                    {/* Public routes */}
                    <Route path="/" element={<Index />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/signup/:referralCode" element={<ReferralHandler />} />
                    <Route path="/referral/:referralCode" element={<ReferralHandler />} />
                    <Route path="/about-us" element={<AboutUs />} />
                    <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                    <Route path="/help-and-support" element={<HelpAndSupport />} />
                    <Route path="/app-download" element={<AppDownload />} />
                    <Route path="/maintenance" element={<Maintenance />} />

                    {/* Protected routes */}
                    <Route path="/market" element={<ProtectedRoute><Market /></ProtectedRoute>} />
                    <Route path="/markets" element={<ProtectedRoute><Market /></ProtectedRoute>} />
                    <Route path="/trading/:coinSymbol?" element={<ProtectedRoute><Trading /></ProtectedRoute>} />
                    <Route path="/swap" element={<ProtectedRoute><Swap /></ProtectedRoute>} />
                    <Route path="/bot-trade" element={<ProtectedRoute><BotTrade /></ProtectedRoute>} />
                    <Route path="/bot-trade/details/:tradeId" element={<ProtectedRoute><BotTradeDetails /></ProtectedRoute>} />
                    <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
                    <Route path="/orders/all" element={<ProtectedRoute><OrdersAll /></ProtectedRoute>} />
                    <Route path="/orders/running" element={<ProtectedRoute><OrdersRunning /></ProtectedRoute>} />
                    <Route path="/orders/completed" element={<ProtectedRoute><OrdersCompleted /></ProtectedRoute>} />
                    <Route path="/wallet" element={<ProtectedRoute><Wallet /></ProtectedRoute>} />
                    <Route path="/wallets" element={<ProtectedRoute><Wallet /></ProtectedRoute>} />
                    <Route path="/balance-transfer" element={<ProtectedRoute><BalanceTransfer /></ProtectedRoute>} />
                    <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
                    <Route path="/settings/profile" element={<ProtectedRoute><ProfileSettings /></ProtectedRoute>} />
                    <Route path="/settings/kyc" element={<ProtectedRoute><KycSettings /></ProtectedRoute>} />
                    <Route path="/settings/password" element={<ProtectedRoute><PasswordChange /></ProtectedRoute>} />
                    
                    {/* Deposit and Withdraw routes */}
                    <Route path="/deposit" element={<ProtectedRoute><Deposit /></ProtectedRoute>} />
                    <Route path="/deposit/:methodId" element={<ProtectedRoute><DepositDetail /></ProtectedRoute>} />
                    <Route path="/deposit/pending/:depositId" element={<ProtectedRoute><DepositPending /></ProtectedRoute>} />
                    <Route path="/withdraw" element={<ProtectedRoute><Withdraw /></ProtectedRoute>} />
                    <Route path="/withdraw/:methodId" element={<ProtectedRoute><WithdrawDetail /></ProtectedRoute>} />
                    <Route path="/withdraw/pending/:withdrawId" element={<ProtectedRoute><WithdrawPending /></ProtectedRoute>} />
                    <Route path="/withdraw/pin" element={<ProtectedRoute><WithdrawPin /></ProtectedRoute>} />
                    
                    {/* Transaction routes */}
                    <Route path="/transactions" element={<ProtectedRoute><Transactions /></ProtectedRoute>} />
                    <Route path="/deposit/logs" element={<ProtectedRoute><DepositLogs /></ProtectedRoute>} />
                    <Route path="/withdraw/logs" element={<ProtectedRoute><WithdrawLogs /></ProtectedRoute>} />
                    <Route path="/transfer/logs" element={<ProtectedRoute><TransferLogs /></ProtectedRoute>} />
                    <Route path="/commission" element={<ProtectedRoute><Commissions /></ProtectedRoute>} />
                    <Route path="/commissions" element={<ProtectedRoute><Commissions /></ProtectedRoute>} />
                    
                    {/* Other protected routes */}
                    <Route path="/referral" element={<ProtectedRoute><Referral /></ProtectedRoute>} />
                    <Route path="/nfts" element={<ProtectedRoute><Nfts /></ProtectedRoute>} />
                    <Route path="/all-nfts" element={<ProtectedRoute><Nfts /></ProtectedRoute>} />
                    <Route path="/nft/:id" element={<ProtectedRoute><NftDetails /></ProtectedRoute>} />
                    <Route path="/nft-details" element={<ProtectedRoute><NftDetails /></ProtectedRoute>} />
                    <Route path="/nft-invests" element={<ProtectedRoute><NftInvests /></ProtectedRoute>} />
                    <Route path="/tools" element={<ProtectedRoute><AllTools /></ProtectedRoute>} />
                    <Route path="/all-tools" element={<ProtectedRoute><AllTools /></ProtectedRoute>} />
                    <Route path="/daily-checkin" element={<ProtectedRoute><DailyCheckin /></ProtectedRoute>} />
                    <Route path="/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />

                    {/* Admin routes */}
                    <Route path="/admin/login" element={<AdminLogin />} />
                    <Route path="/admin" element={<AdminProtectedRoute><AdminDashboard /></AdminProtectedRoute>} />
                    <Route path="/admin/dashboard" element={<AdminProtectedRoute><AdminDashboard /></AdminProtectedRoute>} />
                    <Route path="/admin/users" element={<AdminProtectedRoute><AdminUsers /></AdminProtectedRoute>} />
                    <Route path="/admin/users/:userId" element={<AdminProtectedRoute><AdminUserDetail /></AdminProtectedRoute>} />
                    <Route path="/admin/coins" element={<AdminProtectedRoute><AdminCoins /></AdminProtectedRoute>} />
                    <Route path="/admin/nfts" element={<AdminProtectedRoute><AdminNfts /></AdminProtectedRoute>} />
                    <Route path="/admin/banners" element={<AdminProtectedRoute><AdminBanners /></AdminProtectedRoute>} />
                    <Route path="/admin/deposit/methods" element={<AdminProtectedRoute><AdminDepositMethods /></AdminProtectedRoute>} />
                    <Route path="/admin/deposit/methods/add" element={<AdminProtectedRoute><AdminDepositMethodAdd /></AdminProtectedRoute>} />
                    <Route path="/admin/deposit/methods/edit/:id" element={<AdminProtectedRoute><AdminDepositMethodEdit /></AdminProtectedRoute>} />
                    <Route path="/admin/withdraw/methods" element={<AdminProtectedRoute><AdminWithdrawMethods /></AdminProtectedRoute>} />
                    <Route path="/admin/withdraw/methods/add" element={<AdminProtectedRoute><AdminWithdrawMethodAdd /></AdminProtectedRoute>} />
                    <Route path="/admin/withdraw/methods/edit/:id" element={<AdminProtectedRoute><AdminWithdrawMethodEdit /></AdminProtectedRoute>} />
                    <Route path="/admin/deposit/pending" element={<AdminProtectedRoute><AdminPendingDeposits /></AdminProtectedRoute>} />
                    <Route path="/admin/deposit/logs" element={<AdminProtectedRoute><AdminDepositLogs /></AdminProtectedRoute>} />
                    <Route path="/admin/withdraw/pending" element={<AdminProtectedRoute><AdminPendingWithdrawals /></AdminProtectedRoute>} />
                    <Route path="/admin/withdraw/logs" element={<AdminProtectedRoute><AdminWithdrawLogs /></AdminProtectedRoute>} />
                    <Route path="/admin/kyc/pending-data" element={<AdminProtectedRoute><AdminPendingKyc /></AdminProtectedRoute>} />
                    <Route path="/admin/nft-invests" element={<AdminProtectedRoute><AdminNftInvests /></AdminProtectedRoute>} />
                    <Route path="/admin/transactions" element={<AdminProtectedRoute><AdminTransactions /></AdminProtectedRoute>} />
                    <Route path="/admin/transfer-logs" element={<AdminProtectedRoute><AdminTransferLogs /></AdminProtectedRoute>} />
                    <Route path="/admin/setting" element={<AdminProtectedRoute><AdminSettings /></AdminProtectedRoute>} />
                    <Route path="/admin/profile-setting" element={<AdminProtectedRoute><AdminProfileSettings /></AdminProtectedRoute>} />
                    <Route path="/admin/app-settings" element={<AdminProtectedRoute><AdminAppSettings /></AdminProtectedRoute>} />
                    <Route path="/admin/contact-details" element={<AdminProtectedRoute><AdminContactDetails /></AdminProtectedRoute>} />
                    <Route path="/admin/notice" element={<AdminProtectedRoute><AdminNoticeSetup /></AdminProtectedRoute>} />
                    <Route path="/admin/daily-checkin-setup" element={<AdminProtectedRoute><AdminDailyCheckinSetup /></AdminProtectedRoute>} />
                    <Route path="/admin/referral-setting" element={<AdminProtectedRoute><AdminReferralSetting /></AdminProtectedRoute>} />
                    <Route path="/admin/trade-setting" element={<AdminProtectedRoute><AdminTradeSetting /></AdminProtectedRoute>} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                  <ConditionalBottomNavigation />
                </div>
              </AnimationProvider>
            </AdminAuthProvider>
          </UserDataProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
