import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import BottomNavigation from "../components/BottomNavigation";
import TradingControls from "../components/TradingControls";
import LiveOrders from "../components/LiveOrders";
import TradeResultPopup from "../components/TradeResultPopup";
import { useTradingOrders } from "../hooks/useTradingOrders";
import { useTradeAutoClose } from "../hooks/useTradeAutoClose";
import { useTradeResults } from "../hooks/useTradeResults";
import { useBinancePrice } from "../hooks/useBinancePrice";
import { useUserData } from "@/contexts/UserDataContext";
import { useCoinSettings } from "../hooks/useCoinSettings";
import { notify } from "../utils/notifications";
import { getSupabaseClient } from "@/integrations/supabase/client";

const Trading = () => {
  const { coinSymbol } = useParams();
  const coinCode = coinSymbol ? coinSymbol.toUpperCase() : "BTC";
  const { orders, placeOrder } = useTradingOrders(coinCode);
  const { userData, updateBalance } = useUserData();
  const balance = userData.balance;
  const { coinSettings, loading: coinSettingsLoading } = useCoinSettings(coinCode);
  const [currencySymbol, setCurrencySymbol] = useState('$');
  
  // Auto close trades when user is away
  useTradeAutoClose();
  
  // Handle trade results popup
  const { showResultPopup, currentTradeResult, closeResultPopup } = useTradeResults();

  // Fetch site settings for currency symbol
  useEffect(() => {
    const fetchSiteSettings = async () => {
      try {
        const supabase = await getSupabaseClient();
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

    fetchSiteSettings();
  }, []);

  // Log coin settings when they load
  useEffect(() => {
    if (coinSettings) {
      console.log(`Coin ${coinCode} settings loaded:`, {
        profit_loss: coinSettings.profit_loss
      });
    }
  }, [coinSettings, coinCode]);

  const handlePlaceOrder = async (orderData: {
    type: 'BUY' | 'SELL';
    amount: number;
    timer: number;
    openPrice: number;
  }) => {
    console.log('handlePlaceOrder called with:', orderData);
    
    // Check if coin settings are loaded
    if (coinSettingsLoading) {
      notify.error('Loading coin settings, please wait...');
      return;
    }

    if (!coinSettings) {
      notify.error(`No settings found for ${coinCode}. Please contact support.`);
      return;
    }

    // Check if user has zero balance
    if (balance === 0) {
      notify.error('You have no balance available. Please deposit funds to start trading.');
      return;
    }

    // Check if user has sufficient balance
    if (balance < orderData.amount) {
      notify.error(`Insufficient balance! Need ${currencySymbol}${orderData.amount.toFixed(2)}, have ${currencySymbol}${balance.toFixed(2)}`);
      return;
    }

    try {
      console.log('Calling placeOrder function...');
      await placeOrder(orderData);
      console.log('Order placed successfully');
      
      // Update balance immediately in global context
      updateBalance(balance - orderData.amount);
      
    } catch (error: any) {
      console.error('Error in handlePlaceOrder:', error);
      // Check for specific insufficient balance error from database
      if (error?.code === 'P0001' && error?.message?.includes('Insufficient balance')) {
        notify.error(`Insufficient balance! Need ${currencySymbol}${orderData.amount.toFixed(2)}, have ${currencySymbol}${balance.toFixed(2)}`);
      } else if (error?.message?.includes('Insufficient balance or user not found')) {
        notify.error('Insufficient balance or user account issue. Please check your balance and try again.');
      } else {
        notify.error('Failed to place order. Please try again.');
      }
    }
  };

  useEffect(() => {
    // Get coin symbol from URL like /trading/BCH or use BTC as default
    const symbol = `BINANCE:${coinCode}USDT`; // e.g., BINANCE:BCHUSDT

    const interval = "1"; // 1-minute
    const theme = "Dark";
    const backgroundColor = "black";
    const pageUri = window.location.origin + window.location.pathname;

    const widgetSettings = {
      symbol: symbol,
      frameElementId: "tradingview_dynamic",
      interval: interval,
      hide_top_toolbar: "1",
      hide_legend: "1",
      hide_side_toolbar: "1",
      hide_symbol_logo: "1",
      allow_symbol_change: "1",
      save_image: "1",
      backgroundColor: backgroundColor,
      studies: [],
      theme: theme,
      style: "1",
      timezone: "Etc/UTC",
      studies_overrides: {},
      utm_source: window.location.hostname,
      utm_medium: "widget",
      utm_campaign: "chart",
      utm_term: symbol,
      "page-uri": pageUri
    };

    // Properly encode the widget settings as a JSON string
    const encodedSettings = encodeURIComponent(JSON.stringify(widgetSettings));
    const iframeSrc = `https://s.tradingview.com/widgetembed/?hideideas=1&overrides=%7B%7D&enabled_features=%5B%5D&disabled_features=%5B%5D&locale=en#${encodedSettings}`;

    const iframe = document.createElement("iframe");
    iframe.id = "tradingview_dynamic";
    iframe.src = iframeSrc;
    iframe.title = "Advanced Chart TradingView Widget";
    iframe.lang = "en";
    iframe.frameBorder = "0";
    iframe.scrolling = "no";
    iframe.allowFullscreen = true;
    iframe.style.cssText = "width: 100%; height: 100%;";

    const chartContainer = document.getElementById("chart-container");
    if (chartContainer) {
      // Clear any existing content
      chartContainer.innerHTML = '';
      chartContainer.appendChild(iframe);
    }

    return () => {
      if (chartContainer) {
        chartContainer.innerHTML = '';
      }
    };
  }, [coinCode]);

  return (
    <div className="relative min-h-[100vh] mx-auto max-w-[480px] bg-black overflow-y-hidden">
      <div className="min-h-[100vh] pt-[0px] pb-[63px]">
        <div className="_relative_lq8ol_15 _z-[1]_lq8ol_510">
          {/* Header Section - Show balance only */}
          <div className="_relative_lq8ol_15 overflow-hidden mb-[10px]">
            <div className="px-[15px] py-[15px] relative z-[2] rounded-b-[30px] px-[10px] pb-[5px]">
              <div className="_flex_lq8ol_19 _gap-3_lq8ol_180 _items-center_lq8ol_27 _justify-between_lq8ol_31">
                <div className="_flex_lq8ol_19 _gap-2_lq8ol_43 _items-center_lq8ol_27 bg-black/20 _border_lq8ol_234 border-gray-500/50 blackdrop-blur _rounded-full_lq8ol_119">
                  <img className="w-[48px] _aspect-square_lq8ol_685 _border_lq8ol_234 border-gray-500/50 _rounded-full_lq8ol_119" src="https://img.freepik.com/premium-photo/3d-cartoon-avatar-man-minimal-3d-character_652053-2070.jpg" alt="" />
                  <div className="px-2">
                    <div className="text-xs font-bold text-white">
                      {coinCode} Trading
                    </div>
                  </div>
                </div>
                <div className="_flex_lq8ol_19 _gap-2_lq8ol_43 _items-center_lq8ol_27 bg-black/20 _border_lq8ol_234 border-gray-500/50 blackdrop-blur _rounded-full_lq8ol_119 ps-[10px]">
                  <h1 className="_text-white_lq8ol_196">
                    {currencySymbol}{balance.toFixed(2)}
                  </h1>
                  <img className="w-[48px] _aspect-square_lq8ol_685 _border_lq8ol_234 border-gray-500/50 _rounded-full_lq8ol_119" src="https://openseauserdata.com/files/bb8d7f8bb662338f03224cb67bbccf0b.gif" alt="" />
                </div>
              </div>
            </div>
          </div>

          {/* Trading Chart Section */}
          <div className="_relative_lq8ol_15 _border_lq8ol_234 border-black h-[calc(100vh-282px)] _w-[100%]_lq8ol_371">
            <div id="chart-container" style={{ width: '100%', height: '100%' }}>
              {/* Show chart container immediately */}
            </div>

            <LiveOrders orders={orders} />
          </div>

          {/* Trading Controls */}
          <TradingControls coinSymbol={coinCode} onPlaceOrder={handlePlaceOrder} />
        </div>
      </div>
      
      {/* Trade Result Popup */}
      <TradeResultPopup
        isOpen={showResultPopup}
        onClose={closeResultPopup}
        tradeResult={currentTradeResult}
      />
    </div>
  );
};

export default Trading;
