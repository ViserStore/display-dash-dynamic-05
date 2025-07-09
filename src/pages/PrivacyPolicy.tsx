
import React from 'react';
import BottomNavigation from '../components/BottomNavigation';

const PrivacyPolicy = () => {
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
                    <h1 className="text-white font-bold">Privacy Policy</h1>
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
                <p style={{textAlign: 'center'}}>
                  <span style={{color: 'hsl(90, 75%, 60%)', fontSize: '24px'}}>
                    <strong>Our Policy</strong>
                  </span>
                </p>
                <p style={{textAlign: 'center'}}>&nbsp;</p>
                
                <p>
                  <span style={{color: 'hsl(90, 75%, 60%)'}}>
                    <strong>1. Introduction</strong>
                  </span> Welcome to TradeBull. Your privacy is important to us, and we are committed to protecting the personal information you share with us. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services.
                </p>
                <p>&nbsp;</p>
                
                <p>
                  <span style={{color: 'hsl(90, 75%, 60%)'}}>
                    <strong>2. Information We Collect</strong>
                  </span> We may collect the following types of information:
                </p>
                <p><strong>Personal Information:</strong> Name, email address, phone number, payment details, and other information you provide when registering or using our services.</p>
                <p><strong>Financial Information:</strong> Trading history, deposit/withdrawal details, and transaction records.</p>
                <p><strong>Technical Information:</strong> IP address, browser type, operating system, device information, and cookies.</p>
                <p><strong>Usage Data:</strong> Information about how you use our website and services, including interactions and preferences.</p>
                <p>&nbsp;</p>
                
                <p>
                  <span style={{color: 'hsl(90, 75%, 60%)'}}>
                    <strong>3. How We Use Your Information</strong>
                  </span> We use the information collected to:
                </p>
                <p>Provide and maintain our services.</p>
                <p>Process transactions and manage your account.</p>
                <p>Improve our website and enhance user experience.</p>
                <p>Ensure security and prevent fraudulent activities.</p>
                <p>Comply with legal and regulatory requirements.</p>
                <p>Send marketing communications (you may opt out at any time).</p>
                <p>&nbsp;</p>
                
                <p>
                  <span style={{color: 'hsl(90, 75%, 60%)'}}>
                    <strong>4. Data Sharing and Disclosure</strong>
                  </span> We do not sell, rent, or trade your personal information. However, we may share it with:
                </p>
                <p><strong>Service Providers:</strong> Third-party vendors who assist in operations, such as payment processing and security services.</p>
                <p><strong>Legal Authorities:</strong> When required by law, court orders, or regulatory authorities.</p>
                <p><strong>Business Transfers:</strong> In case of a merger, acquisition, or sale of assets, your data may be transferred to a new entity.</p>
                <p>&nbsp;</p>
                
                <p>
                  <span style={{color: 'hsl(90, 75%, 60%)'}}>
                    <strong>5. Data Security</strong>
                  </span> We implement industry-standard security measures to protect your personal information. However, no method of transmission over the internet is 100% secure. We encourage you to use strong passwords and take necessary precautions to protect your account.
                </p>
                <p>&nbsp;</p>
                
                <p>
                  <span style={{color: 'hsl(90, 75%, 60%)'}}>
                    <strong>6. Cookies and Tracking Technologies</strong>
                  </span> TradeBull uses cookies and similar technologies to enhance user experience. You can manage cookie preferences through your browser settings. Disabling cookies may affect certain website functionalities.
                </p>
                <p>&nbsp;</p>
                
                <p>
                  <span style={{color: 'hsl(90, 75%, 60%)'}}>
                    <strong>7. Third-Party Links</strong>
                  </span> Our website may contain links to third-party websites. We are not responsible for the privacy practices of these external sites. We encourage you to review their privacy policies before providing any personal information.
                </p>
                <p>&nbsp;</p>
                
                <p>
                  <span style={{color: 'hsl(90, 75%, 60%)'}}>
                    <strong>8. Your Rights and Choices</strong>
                  </span> Depending on your jurisdiction, you may have the right to:
                </p>
                <p>Access, update, or delete your personal data.</p>
                <p>Object to certain processing activities.</p>
                <p>Withdraw consent for marketing communications.</p>
                <p>Lodge complaints with a data protection authority.</p>
                <p>&nbsp;</p>
                
                <p>
                  <span style={{color: 'hsl(90, 75%, 60%)'}}>
                    <strong>9. Changes to This Privacy Policy</strong>
                  </span> We may update this Privacy Policy from time to time. Any changes will be posted on this page with an updated "Effective Date." We encourage you to review this policy periodically.
                </p>
              </div>
            </div>

            
          </div>
        </div>
      </div>
    </>
  );
};

export default PrivacyPolicy;
