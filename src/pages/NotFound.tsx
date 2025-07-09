
import { useLocation, Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center relative mx-auto max-w-[480px]">
      <div className="text-center px-8">
        {/* 404 Number */}
        <div className="mb-8">
          <h1 className="text-8xl font-bold text-lime-500 mb-4">404</h1>
          <div className="w-20 h-1 bg-lime-500 mx-auto rounded-full"></div>
        </div>

        {/* Error Message */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Page Not Found</h2>
          <p className="text-gray-400 text-lg mb-2">
            Oops! The page you're looking for doesn't exist.
          </p>
          <p className="text-gray-500 text-sm">
            It might have been moved, deleted, or you entered the wrong URL.
          </p>
        </div>

        {/* Action Button */}
        <div className="mb-8">
          <Link 
            to="/" 
            className="inline-block w-full bg-lime-500 hover:bg-lime-600 text-black font-semibold py-4 px-6 rounded-full transition-colors duration-200 cursor-pointer"
          >
            Go Back Home
          </Link>
        </div>

        {/* Decorative Elements */}
        <div className="mt-12 flex justify-center space-x-2">
          <div className="w-2 h-2 bg-lime-500 rounded-full animate-pulse"></div>
          <div className="w-2 h-2 bg-lime-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-2 h-2 bg-lime-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
        </div>
      </div>

      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 border border-lime-500 rounded-full"></div>
        <div className="absolute bottom-32 right-8 w-24 h-24 border border-lime-500 rounded-full"></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 border border-lime-500 rounded-full"></div>
      </div>
    </div>
  );
};

export default NotFound;
