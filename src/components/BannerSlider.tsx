
import React, { useState, useEffect } from 'react';
import { supabaseReady } from '@/integrations/supabase/client';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";

interface Banner {
  id: string;
  image_url: string;
  status: string;
  created_at: string;
  updated_at: string;
}

const BannerSlider = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const plugin = React.useRef(
    Autoplay({ delay: 3000, stopOnInteraction: true })
  );

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const supabase = await supabaseReady;
        const { data, error } = await supabase
          .from('banners')
          .select('*')
          .eq('status', 'active')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching banners:', error);
          return;
        }

        setBanners(data || []);
      } catch (error) {
        console.error('Error fetching banners:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBanners();
  }, []);

  useEffect(() => {
    if (!api) {
      return;
    }

    setCurrent(api.selectedScrollSnap());

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  // Show clean bar while loading or when no banners found
  if (isLoading || banners.length === 0) {
    return (
      <div className="px-[15px] pb-[15px]">
        <div className="">
          <div className="swiper swiper-initialized swiper-horizontal mySwiper rounded-[20px]">
            <div className="swiper-wrapper" style={{ transitionDuration: '0ms', transitionDelay: '0ms' }}></div>
            <div className="swiper-pagination swiper-pagination-bullets swiper-pagination-horizontal swiper-pagination-lock"></div>
            <div className="skeleton h-[160px] w-[100%] bg-gray-300 rounded-[20px]"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '15px', paddingTop: '0' }}>
      <div style={{ width: '100%', maxWidth: '100%', overflow: 'hidden', position: 'relative' }}>
        <Carousel 
          setApi={setApi}
          plugins={[plugin.current]}
          style={{ width: '100%' }}
          onMouseEnter={plugin.current.stop}
          onMouseLeave={plugin.current.reset}
        >
          <CarouselContent>
            {banners.map((banner) => (
              <CarouselItem key={banner.id}>
                <div style={{ padding: '2px' }}>
                  <img 
                    src={banner.image_url}
                    alt={`Banner ${banner.id}`}
                    style={{ 
                      height: '160px', 
                      width: '100%', 
                      objectFit: 'cover',
                      borderRadius: '20px'
                    }}
                    onError={(e) => {
                      e.currentTarget.src = '/placeholder.svg';
                    }}
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
        
        {/* Pagination Dots */}
        {banners.length > 1 && (
          <div style={{
            position: 'absolute',
            bottom: '15px',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: '8px',
            alignItems: 'center'
          }}>
            {banners.map((_, index) => (
              <span
                key={index}
                onClick={() => api?.scrollTo(index)}
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: current === index ? '#ffffff' : 'rgba(255, 255, 255, 0.5)',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.3)'
                }}
                className={current === index ? 'swiper-pagination-bullet swiper-pagination-bullet-active' : 'swiper-pagination-bullet'}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BannerSlider;
