
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import BottomNavigation from '../components/BottomNavigation';
import PageHeader from '../components/PageHeader';

interface ContactDetail {
  id: string;
  name: string;
  link: string;
  status: string;
}

const HelpAndSupport = () => {
  const [contactDetails, setContactDetails] = useState<ContactDetail[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContactDetails();
  }, []);

  const fetchContactDetails = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('contact_details')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching contact details:', error);
      } else {
        setContactDetails(data || []);
      }
    } catch (error) {
      console.error('Error fetching contact details:', error);
    } finally {
      setLoading(false);
    }
  };

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
          

            <PageHeader title="Help & Support" />

            {/* Content */}
            <div className="container mx-auto px-[8px] backdrop-blur overflow-auto h-[calc(100vh-154px)] pt-[30px]">
              <div>
                <h1 className="text-[14px] text-gray-600 mb-3">Contact</h1>
                
                {loading ? (
                  <div className="flex flex-col space-y-2">
                    {Array.from({ length: 3 }, (_, index) => (
                      <div key={index} className="flex items-center gap-2 px-2 py-3 mb-2 animate-pulse">
                        <div className="h-4 bg-gray-600 rounded w-24"></div>
                        <div className="flex-auto"></div>
                        <div className="h-3 bg-gray-700 rounded w-3"></div>
                      </div>
                    ))}
                  </div>
                ) : contactDetails.length === 0 ? (
                  <div className="text-center text-gray-400 py-8">No contact details available</div>
                ) : (
                  contactDetails.map((contact) => (
                    <a 
                      key={contact.id}
                      href={contact.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-gray-200 hover:text-lime-500 px-2 font-semibold text-[16px] py-3 mb-2"
                    >
                      <h1 className="flex-auto">{contact.name}</h1>
                      <i className="fi fi-sr-angle-right text-gray-500 text-[12px] leading-[0px]"></i>
                    </a>
                  ))
                )}
              </div>
            </div>

            
          </div>
        </div>
      </div>
    </>
  );
};

export default HelpAndSupport;
