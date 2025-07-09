
import React from 'react';
import AdminLayout from '@/components/admin/AdminLayout';

const AdminPendingKyc = () => {
  return (
    <>
      
      <AdminLayout>
        <div className="mx-[8px] mt-2">
          <div className="flex items-center mb-3">
            <div className="flex-auto">
              <h1 className="font-bold text-[20px] text-rose-500">Pending Kyc Data</h1>
              <h1 className="font-bold text-[14px] text-gray-400">Manage Pending Kyc Data from Here</h1>
            </div>
          </div>

          <div className="flex justify-center items-center rounded-lg text-white bg-rose-600 shadow-md shadow-rose-700/50 p-2 mb-3">
            <div className="flex-auto flex items-center">
              <i className="fi fi-sr-direction-signal leading-[0px]"></i>
              <h1 className="text-sm font-bold ps-2">KYC Management</h1>
            </div>
          </div>

          {/* Coming Soon Message */}
          <div className="flex flex-col items-center justify-center bg-white rounded-lg shadow-md border border-rose-200 p-12 text-center">
            <div className="mb-6">
              <i className="fi fi-sr-time-clock-circle text-rose-500 text-6xl leading-[0px]"></i>
            </div>
            <h2 className="text-2xl font-bold text-rose-600 mb-2">Coming Soon</h2>
            <p className="text-gray-500 text-lg">KYC Data management feature is under development</p>
            <p className="text-gray-400 text-sm mt-2">This feature will be available in the next update</p>
          </div>
        </div>
      </AdminLayout>
    </>
  );
};

export default AdminPendingKyc;
