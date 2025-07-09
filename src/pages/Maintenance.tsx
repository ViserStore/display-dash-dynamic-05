
import { Link } from 'react-router-dom';
import { Wrench, Clock, AlertTriangle, Mail } from 'lucide-react';

const Maintenance = () => {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center relative mx-auto max-w-[480px]">
      <div className="text-center px-8">
        {/* Maintenance Icon */}
        <div className="mb-8">
          <div className="relative mx-auto w-24 h-24 mb-6">
            <Wrench className="w-24 h-24 text-red-500 animate-pulse" />
            <div className="absolute -top-2 -right-2">
              <AlertTriangle className="w-8 h-8 text-yellow-500" />
            </div>
          </div>
          <div className="w-20 h-1 bg-red-500 mx-auto rounded-full"></div>
        </div>

        {/* Blocked Message */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-4">Website Blocked</h1>
          <p className="text-gray-400 text-lg mb-4">
            This website has been temporarily blocked and is not accessible.
          </p>
          <p className="text-gray-500 text-sm mb-6">
            Access has been restricted for this domain.
          </p>
        </div>

        {/* Activation Info */}
        <div className="mb-8">
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Mail className="w-5 h-5 text-lime-500" />
              <span className="text-white font-semibold">Website Activation</span>
            </div>
            <p className="text-gray-300 text-sm mb-3">
              If you want to activate or run this website, please contact us:
            </p>
            <div className="bg-gray-900/50 border border-lime-500/30 rounded-lg p-3">
              <p className="text-lime-400 font-mono text-sm">
                admin@tradebull.com
              </p>
            </div>
          </div>
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
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
        </div>
      </div>

      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 border border-red-500 rounded-full"></div>
        <div className="absolute bottom-32 right-8 w-24 h-24 border border-red-500 rounded-full"></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 border border-red-500 rounded-full"></div>
        <div className="absolute top-1/3 right-1/3 w-12 h-12 border border-yellow-500 rounded-full"></div>
      </div>
    </div>
  );
};

export default Maintenance;
