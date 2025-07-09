import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { notify } from '@/utils/notifications';
import AdminLayout from '@/components/admin/AdminLayout';

interface ContactDetail {
  id: string;
  name: string;
  link: string;
  status: string;
}

const AdminContactDetails = () => {
  const [contacts, setContacts] = useState<ContactDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedContact, setSelectedContact] = useState<ContactDetail | null>(null);
  const [formData, setFormData] = useState({ name: '', link: '' });

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('contact_details')
        .select('*')
        .order('created_at');

      if (error) throw error;
      setContacts(data || []);
    } catch (error) {
      console.error('Error fetching contacts:', error);
      notify.error('Failed to fetch contact details');
    } finally {
      setLoading(false);
    }
  };

  const handleAddContact = async () => {
    if (!formData.name || !formData.link) {
      notify.error('Please fill all fields');
      return;
    }

    try {
      const { error } = await supabase
        .from('contact_details')
        .insert({
          name: formData.name,
          link: formData.link
        });

      if (error) throw error;
      
      notify.success('Contact added successfully!');
      setShowAddModal(false);
      setFormData({ name: '', link: '' });
      fetchContacts();
    } catch (error) {
      console.error('Error adding contact:', error);
      notify.error('Failed to add contact');
    }
  };

  const handleUpdateContact = async () => {
    if (!selectedContact || !formData.name || !formData.link) {
      notify.error('Please fill all fields');
      return;
    }

    try {
      const { error } = await supabase
        .from('contact_details')
        .update({
          name: formData.name,
          link: formData.link
        })
        .eq('id', selectedContact.id);

      if (error) throw error;
      
      notify.success('Contact updated successfully!');
      setShowEditModal(false);
      setSelectedContact(null);
      setFormData({ name: '', link: '' });
      fetchContacts();
    } catch (error) {
      console.error('Error updating contact:', error);
      notify.error('Failed to update contact');
    }
  };

  const handleDeleteContact = async () => {
    if (!selectedContact) return;

    try {
      const { error } = await supabase
        .from('contact_details')
        .delete()
        .eq('id', selectedContact.id);

      if (error) throw error;
      
      notify.success('Contact deleted successfully!');
      setShowDeleteModal(false);
      setSelectedContact(null);
      fetchContacts();
    } catch (error) {
      console.error('Error deleting contact:', error);
      notify.error('Failed to delete contact');
    }
  };

  const openEditModal = (contact: ContactDetail) => {
    setSelectedContact(contact);
    setFormData({ name: contact.name, link: contact.link });
    setShowEditModal(true);
  };

  const openDeleteModal = (contact: ContactDetail) => {
    setSelectedContact(contact);
    setShowDeleteModal(true);
  };

  const closeModals = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setShowDeleteModal(false);
    setSelectedContact(null);
    setFormData({ name: '', link: '' });
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
          <div className="flex justify-center items-center rounded-lg text-white bg-rose-600 shadow-md shadow-rose-700/50 p-2 mb-3">
            <div className="flex-auto flex items-center">
              <i className="fi fi-sr-direction-signal leading-[0px]"></i>
              <h1 className="text-sm font-bold ps-2">Manage Contact Details</h1>
            </div>
            <i 
              className="fi fi-sr-add leading-[0px] cursor-pointer"
              onClick={() => setShowAddModal(true)}
            ></i>
          </div>

          <div className="overflow-x-auto bg-white shadow-md border border-rose-200 rounded-lg p-2">
            <table className="table">
              <thead>
                <tr className="text-rose-700 font-bold">
                  <th>SL.</th>
                  <th>Name</th>
                  <th>Link</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {contacts.map((contact, index) => (
                  <tr key={contact.id} className="align-middle text-rose-500">
                    <th>{index + 1}</th>
                    <td>
                      <div className="flex items-center gap-2">{contact.name}</div>
                    </td>
                    <td className="font-semibold">
                      <a href={contact.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        {contact.link.length > 30 ? `${contact.link.substring(0, 30)}...` : contact.link}
                      </a>
                    </td>
                    <td className="text-green-500">{contact.status}</td>
                    <td>
                      <div className="grid gap-2">
                        <button 
                          className="bg-amber-500 hover:bg-amber-600 rounded-md text-[14px] text-white font-bold px-2 py-1 w-[100%]"
                          onClick={() => openEditModal(contact)}
                        >
                          Edit
                        </button>
                        <button 
                          className="bg-red-500 hover:bg-red-600 rounded-md text-[14px] text-white font-bold px-2 py-1 w-[100%]"
                          onClick={() => openDeleteModal(contact)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Add Contact Modal */}
          {showAddModal && (
            <div className="fixed inset-0 z-50 flex justify-center items-center bg-gray-900/60">
              <div className="relative p-4 w-full max-w-md">
                <div className="relative bg-white rounded-lg shadow">
                  <button 
                    type="button" 
                    className="absolute top-3 end-2.5 text-gray-400 hover:text-gray-900 rounded-lg text-sm w-8 h-8 flex justify-center items-center"
                    onClick={closeModals}
                  >
                    <span className="text-xl">&times;</span>
                  </button>
                  <div className="p-4 md:p-5 text-center">
                    <h3 className="mb-5 text-lg font-normal text-gray-500">Add Contact List</h3>
                    <div className="relative">
                      <div className="relative mb-3">
                        <div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none">
                          <i className="fi fi-ss-customer-service leading-[0px]"></i>
                        </div>
                        <input 
                          className="text-gray-800 focus:text-gray-800 bg-transparent border hover:border-lime-500 focus:border-lime-500 focus:outline-0 text-sm rounded-md block w-full ps-10 p-2.5"
                          placeholder="Enter Contact Name"
                          value={formData.name}
                          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        />
                      </div>
                    </div>
                    <div className="relative">
                      <div className="relative mb-3">
                        <div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none">
                          <i className="fi fi-ss-link leading-[0px]"></i>
                        </div>
                        <input 
                          className="text-gray-800 focus:text-gray-800 bg-transparent border hover:border-lime-500 focus:border-lime-500 focus:outline-0 text-sm rounded-md block w-full ps-10 p-2.5"
                          placeholder="Enter Contact Link"
                          value={formData.link}
                          onChange={(e) => setFormData(prev => ({ ...prev, link: e.target.value }))}
                        />
                      </div>
                    </div>
                    <button 
                      type="button" 
                      className="text-white bg-rose-600 hover:bg-rose-800 font-medium rounded-lg text-sm px-5 py-2.5 mr-2"
                      onClick={handleAddContact}
                    >
                      Add Contact
                    </button>
                    <button 
                      type="button" 
                      className="py-2.5 px-5 text-sm font-medium text-gray-900 bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-rose-700"
                      onClick={closeModals}
                    >
                      No, cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Edit Contact Modal */}
          {showEditModal && (
            <div className="fixed inset-0 z-50 flex justify-center items-center bg-gray-900/60">
              <div className="relative p-4 w-full max-w-md">
                <div className="relative bg-white rounded-lg shadow">
                  <button 
                    type="button" 
                    className="absolute top-3 end-2.5 text-gray-400 hover:text-gray-900 rounded-lg text-sm w-8 h-8 flex justify-center items-center"
                    onClick={closeModals}
                  >
                    <span className="text-xl">&times;</span>
                  </button>
                  <div className="p-4 md:p-5 text-center">
                    <h3 className="mb-5 text-lg font-normal text-gray-500">Update Contact List</h3>
                    <div className="relative">
                      <div className="relative mb-3">
                        <div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none">
                          <i className="fi fi-ss-customer-service leading-[0px]"></i>
                        </div>
                        <input 
                          className="text-gray-800 focus:text-gray-800 bg-transparent border hover:border-lime-500 focus:border-lime-500 focus:outline-0 text-sm rounded-md block w-full ps-10 p-2.5"
                          placeholder="Enter Contact Name"
                          value={formData.name}
                          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        />
                      </div>
                    </div>
                    <div className="relative">
                      <div className="relative mb-3">
                        <div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none">
                          <i className="fi fi-ss-link leading-[0px]"></i>
                        </div>
                        <input 
                          className="text-gray-800 focus:text-gray-800 bg-transparent border hover:border-lime-500 focus:border-lime-500 focus:outline-0 text-sm rounded-md block w-full ps-10 p-2.5"
                          placeholder="Enter Contact Link"
                          value={formData.link}
                          onChange={(e) => setFormData(prev => ({ ...prev, link: e.target.value }))}
                        />
                      </div>
                    </div>
                    <button 
                      type="button" 
                      className="text-white bg-rose-600 hover:bg-rose-800 font-medium rounded-lg text-sm px-5 py-2.5 mr-2"
                      onClick={handleUpdateContact}
                    >
                      Update Contact
                    </button>
                    <button 
                      type="button" 
                      className="py-2.5 px-5 text-sm font-medium text-gray-900 bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-rose-700"
                      onClick={closeModals}
                    >
                      No, cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Delete Contact Modal */}
          {showDeleteModal && (
            <div className="fixed inset-0 z-50 flex justify-center items-center bg-gray-900/60">
              <div className="relative p-4 w-full max-w-md">
                <div className="relative bg-white rounded-lg shadow">
                  <button 
                    type="button" 
                    className="absolute top-3 end-2.5 text-gray-400 hover:text-gray-900 rounded-lg text-sm w-8 h-8 flex justify-center items-center"
                    onClick={closeModals}
                  >
                    <span className="text-xl">&times;</span>
                  </button>
                  <div className="p-4 md:p-5 text-center">
                    <i className="fi fi-sr-seal-exclamation text-red-500/80 text-[50px]"></i>
                    <h3 className="mb-5 text-lg font-normal text-gray-500">Are you sure to remove this contact?</h3>
                    <button 
                      type="button" 
                      className="text-white bg-red-600 hover:bg-red-800 font-medium rounded-lg text-sm px-5 py-2.5 mr-2"
                      onClick={handleDeleteContact}
                    >
                      Yes, Sure
                    </button>
                    <button 
                      type="button" 
                      className="py-2.5 px-5 text-sm font-medium text-gray-900 bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-rose-700"
                      onClick={closeModals}
                    >
                      No, cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </AdminLayout>
    </>
  );
};

export default AdminContactDetails;
