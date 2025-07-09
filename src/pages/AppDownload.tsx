
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import BottomNavigation from '../components/BottomNavigation';
import PageHeader from '../components/PageHeader';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";

interface AppData {
  app_name: string;
  app_description: string;
  app_logo_url: string;
  app_rating: number;
  app_reviews_count: string;
  app_downloads_count: string;
  app_download_url: string;
  app_screenshots: string[];
  app_about: string;
}

const AppDownload = () => {
  // Fetch app data from the app_settings table
  const { data: appData } = useQuery({
    queryKey: ['app-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('app_settings')
        .select('app_name, app_description, app_logo_url, app_rating, app_reviews_count, app_downloads_count, app_download_url, app_screenshots, app_about')
        .single();
      
      if (error) {
        console.error('Error fetching app data:', error);
        throw error;
      }
      
      return data as AppData;
    }
  });

  const handleDrawerToggle = () => {
    const drawer = document.getElementById('drawer-navigation');
    if (drawer) {
      drawer.classList.toggle('-translate-x-full');
    }
  };

  const handleLogout = () => {
    console.log('Logout clicked');
  };

  return (
    <div className="relative min-h-[100vh] bg-black mx-auto max-w-[480px] overflow-y-hidden">
      <div className="min-h-[100vh] pt-[0px] pb-[63px]">
        <div className="relative z-[1]">
         
          {/* Header Section */}
          <PageHeader title="App Download" />

          {/* Content Section */}
          <div className="relative overflow-x-auto h-[calc(100vh-154px)]">
            <div className="relative z-[2]">
              <div className="p-[15px]">
                <div className="mx-auto">
                  {/* App Info Section */}
                  <div className="flex items-center gap-4 px-3">
                    <div>
                      <img 
                        className="w-[80px] rounded-[20px] shadow-sm bg-lime-950 shadow-lime-500/60" 
                        src={appData?.app_logo_url || '/assets/default-hiMwPs0P.png'} 
                        alt={appData?.app_name || 'App Logo'}
                      />
                    </div>
                    <div className="flex-auto">
                      <h1 className="font-bold text-white text-lg">{appData?.app_name || 'App Name'}</h1>
                      <h1 className="text-md text-gray-300">{appData?.app_description || 'App Description'}</h1>
                      <h1 className="text-[12px] text-gray-400">Contains ads . In-app purchases</h1>
                    </div>
                  </div>

                  {/* Stats Section */}
                  <div className="grid grid-cols-3 gap-4 mt-5">
                    <div className="text-center">
                      <h1 className="text-white text-[13px]">{appData?.app_rating || '4.0'}<i className="fi fi-sr-star text-[10px]"></i></h1>
                      <h1 className="text-lime-600 text-[12px] mt-2">{appData?.app_reviews_count || '1K+'} reviews</h1>
                    </div>
                    <div className="text-center border-r border-l">
                      <h1 className="text-white text-[13px]">{appData?.app_downloads_count || '10K+'}</h1>
                      <h1 className="text-lime-600 text-[12px] mt-2">Downloads</h1>
                    </div>
                    <div className="text-center">
                      <h1 className="text-white text-[13px]"><i className="fi fi-sr-badge-check"></i></h1>
                      <h1 className="text-lime-600 text-[12px] mt-2">Editors' Choice</h1>
                    </div>
                  </div>

                  {/* Download Button */}
                  <div className="flex my-6">
                    <a 
                      className="bg-lime-500 hover:bg-lime-600 py-[10px] !rounded-[10px] w-full text-center text-white" 
                      target="_blank" 
                      href={appData?.app_download_url || '#'}
                    >
                      Install
                    </a>
                  </div>

                  {/* Family Sharing */}
                  <h1 className="text-lime-400 text-[14px] px-2">
                    <i className="fi fi-rr-home-heart text-lime-400 pe-2"></i>
                    You can share this with your family.
                  </h1>

                  {/* Screenshots Section */}
                  <div className="my-4">
                    <Carousel
                      opts={{
                        align: "start",
                        loop: false,
                      }}
                      className="w-full"
                    >
                      <CarouselContent className="-ml-3">
                        {appData?.app_screenshots && appData.app_screenshots.length > 0 ? (
                          appData.app_screenshots.map((screenshot, index) => (
                            <CarouselItem key={index} className="pl-3 basis-auto">
                              <div className="rounded-[10px] border border-gray-700/50 shadow-sm shadow-lime-800">
                                <img 
                                  className="rounded-[10px] w-[113px] h-auto" 
                                  src={screenshot} 
                                  alt={`Screenshot ${index + 1}`}
                                />
                              </div>
                            </CarouselItem>
                          ))
                        ) : (
                          <CarouselItem className="pl-3 basis-auto">
                            <div className="rounded-[10px] border border-gray-700/50 shadow-sm shadow-lime-800 p-4 w-[113px] h-[200px] flex items-center justify-center">
                              <p className="text-gray-400 text-xs text-center">No screenshots available</p>
                            </div>
                          </CarouselItem>
                        )}
                      </CarouselContent>
                    </Carousel>
                  </div>

                  {/* About Section */}
                  <h1 className="font-[400] text-lime-300 text-[18px] px-2 mt-4">About this app</h1>
                  <h5 className="text-lime-500 text-[14px] px-2">
                    {appData?.app_about || 'No description available for this app.'}
                  </h5>
                </div>
              </div>
            </div>
          </div>

          
        </div>
      </div>
    </div>
  );
};

export default AppDownload;
