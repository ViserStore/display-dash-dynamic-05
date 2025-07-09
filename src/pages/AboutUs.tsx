
import React from 'react';
import BottomNavigation from '../components/BottomNavigation';

const AboutUs = () => {
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

  return (
    <>
      
      <div className="relative min-h-[100vh] bg-black mx-auto max-w-[480px] overflow-y-hidden">
        <div className="min-h-[100vh] pt-[0px] pb-[63px]">
          <div className="relative z-[1]">
          

            {/* Header */}
            <div className="relative overflow-hidden mb-[10px]">
              <div className="p-[15px] relative z-[2] rounded-b-[30px]">
                <div className="flex gap-3 items-center justify-between">
                  <div className="flex gap-2 items-center bg-black/20 border border-gray-500/50 backdrop-blur rounded-full px-[20px] h-[48px]">
                    <div>
                      <img 
                        className="w-[18px] backBtn cursor-pointer" 
                        src="https://cdn-icons-png.flaticon.com/128/507/507257.png" 
                        alt="Back"
                        onClick={handleBackClick}
                      />
                    </div>
                    <h1 className="text-white font-bold">About Us</h1>
                  </div>
                  <div className="flex gap-2 items-center bg-black/20 border border-gray-500/50 backdrop-blur rounded-full">
                    <img 
                      className="w-[48px] h-[48px] aspect-square border border-gray-500/50 rounded-full" 
                      src="https://img.freepik.com/premium-photo/3d-cartoon-avatar-man-minimal-3d-character_652053-2070.jpg" 
                      alt="Profile"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="container mx-auto px-[8px] backdrop-blur overflow-auto h-[calc(100vh-154px)]">
              <div className="text-justify">
                <p>&nbsp;</p>
                <h2 style={{textAlign: 'center'}}>
                  <span style={{color: 'hsl(90, 75%, 60%)', fontSize: '22px'}}>
                    <strong>Welcome to TradeBull</strong>
                  </span>
                </h2>
                <p>&nbsp;</p>
                <p>At TradeBull, we believe in the power of smart trading to unlock financial potential. Founded with a vision to revolutionize the trading landscape, TradeBull has grown into a trusted platform that caters to traders of all levels, from beginners to seasoned professionals.</p>
                <p>&nbsp;</p>
                <h4>
                  <span style={{color: 'hsl(90, 75%, 60%)'}}>
                    <strong>Our Mission</strong>
                  </span>
                </h4>
                <p>Our mission is simple: to provide an intuitive, reliable, and innovative trading experience that empowers our users to achieve their financial goals. We strive to create a seamless trading environment where technology and expertise come together to offer unparalleled opportunities in the financial markets.</p>
                <h4>&nbsp;</h4>
                <h4>
                  <span style={{color: 'hsl(90, 75%, 60%)'}}>
                    <strong>What We Offer</strong>
                  </span>
                </h4>
                <ul>
                  <li><strong>Comprehensive Trading Tools:</strong> Our platform is equipped with state-of-the-art tools and features that help you analyze markets, execute trades, and manage your portfolio with ease.</li>
                  <li><strong>Diverse Asset Selection:</strong> Whether you're interested in stocks, forex, commodities, or cryptocurrencies, TradeOption offers a wide range of assets to diversify your investment portfolio.</li>
                  <li><strong>Educational Resources:</strong> We are committed to your success. Our extensive library of educational materials, including webinars, tutorials, and articles, is designed to enhance your trading knowledge and skills.</li>
                  <li><strong>Top-notch Security:</strong> Your security is our priority. TradeOption employs advanced security measures to protect your data and ensure the safety of your investments.</li>
                  <li><strong>Customer Support:</strong> Our dedicated support team is always here to assist you. We offer 24/7 customer support to help you with any questions or issues you may encounter.</li>
                </ul>
                <h4>&nbsp;</h4>
                <h4>
                  <span style={{color: 'hsl(90, 75%, 60%)'}}>
                    <strong>Our Values</strong>
                  </span>
                </h4>
                <ul>
                  <li><strong>Innovation:</strong> We continuously strive to innovate and stay ahead of industry trends, providing you with cutting-edge tools and resources.</li>
                  <li><strong>Transparency:</strong> Trust is the cornerstone of our relationship with our users. We maintain transparency in all our operations, ensuring you have all the information you need to make informed decisions.</li>
                  <li><strong>Integrity:</strong> We adhere to the highest ethical standards, ensuring that our practices are fair, honest, and in the best interest of our users.</li>
                  <li><strong>Community:</strong> We believe in the power of community. TradeOption is not just a platform; it's a community of traders supporting each other on the path to financial success.</li>
                </ul>
                <h4>&nbsp;</h4>
                <h4>
                  <span style={{color: 'hsl(90, 75%, 60%)'}}>
                    <strong>Join Us</strong>
                  </span>
                </h4>
                <p>Join TradeOption today and take the first step towards a smarter, more empowered trading journey. Whether you're looking to grow your wealth, diversify your investments, or simply explore new trading opportunities, we're here to help you every step of the way.</p>
                <p>&nbsp;</p>
                <p>Trade with confidence. Trade with <strong>TradeBull</strong>.</p>
                <p>&nbsp;</p>
              </div>
            </div>

            
          </div>
        </div>
      </div>
    </>
  );
};

export default AboutUs;
