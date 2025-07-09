import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { notify } from '@/utils/notifications';
import AdminLayout from '@/components/admin/AdminLayout';

interface NoticeSetting {
  id: string;
  scrolling_notice: string;
  status: string;
}

const AdminNoticeSetup = () => {
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [noticeId, setNoticeId] = useState<string | null>(null);

  useEffect(() => {
    fetchNoticeSettings();
  }, []);

  const fetchNoticeSettings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('notice_settings')
        .select('*')
        .single();

      if (error) throw error;

      if (data) {
        setNotice(data.scrolling_notice);
        setNoticeId(data.id);
      }
    } catch (error) {
      console.error('Error fetching notice settings:', error);
      notify.error('Failed to fetch notice settings');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateNotice = async () => {
    if (!noticeId) {
      notify.error('Notice settings not found');
      return;
    }

    try {
      setUpdating(true);
      
      const { error } = await supabase
        .from('notice_settings')
        .update({ scrolling_notice: notice })
        .eq('id', noticeId);

      if (error) throw error;

      notify.success('Notice updated successfully!');
    } catch (error) {
      console.error('Error updating notice:', error);
      notify.error('Failed to update notice');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex flex-col justify-center items-center h-[calc(100vh-150px)]">
          <span className="loading loading-bars text-rose-500 loading-lg -mt-[60px]"></span>
        </div>
      </AdminLayout>
    );
  }

  return (
    <>
      <AdminLayout>
        <div className="mx-[8px] mt-2">
          <div className="flex items-center mb-3">
            <div className="flex-auto">
              <h1 className="font-bold text-[20px] text-rose-500">Notice</h1>
              <h1 className="font-bold text-[14px] text-gray-400">Manage Scroling Notice from Here</h1>
            </div>
          </div>

          <div className="card shadow-md shadow-rose-500/40 bg-white">
            <div className="card-body p-3">
              <h1 className="text-20px font-bold text-rose-500">Notice Setup</h1>
              
              <div className="grid grid-cols grid-cols-1 gap-2 mb-3 mt-1">
                <div>
                  <div className="relative">
                    <label 
                      htmlFor="Scroling Notice"
                      className="block mb-2 text-sm font-medium text-gray-200 text-rose-500"
                    >
                      Scroling Notice
                    </label>
                    <div className="relative mb-3">
                      <input
                        className="text-gray-600 focus:text-gray-600 border-2 border-rose-400 hover:border-rose-500 focus:border-rose-500 focus:ring-rose-500 bg-transparent border hover:border-lime-500 focus:border-lime-500 focus:outline-0 text-gray-200 focus:text-gray-200 text-sm rounded-md focus:ring-rose-500 block w-full undefined p-2.5"
                        type="text"
                        placeholder="Enter Scroling Notice"
                        value={notice}
                        onChange={(e) => setNotice(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="button"
                className="bg-gradient-to-r hover:bg-gradient-to-l from-rose-500 to-rose-600 text-white w-[100%] p-2 rounded-[10px] mb-2 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleUpdateNotice}
                disabled={updating}
              >
                {updating ? 'Updating...' : 'Update Notice'}
              </button>
            </div>
          </div>
        </div>
      </AdminLayout>
    </>
  );
};

export default AdminNoticeSetup;
