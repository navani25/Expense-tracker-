
import React, { useState, useRef, useEffect } from 'react';
import { Page, Contact, ContactFormData } from '../types';
import Header from './common/Header';
import BackButton from './common/BackButton';
import AddContactModal from './AddContactModal';

interface ContactsProps {
  setActivePage: (page: Page) => void;
  contacts: Contact[];
  onAddContact: (contact: ContactFormData) => void;
  onUpdateContact: (contact: Contact) => void;
  onDeleteContact: (contactId: string) => void;
}

const ContactItem: React.FC<{ 
  contact: Contact;
  onEdit: () => void;
  onDelete: () => void;
}> = ({ contact, onEdit, onDelete }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuRef]);

  return (
    <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
      <div className="flex items-center space-x-4">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-medium ${contact.avatarColor}`}>
          {contact.name.charAt(0)}
        </div>
        <div>
          <p className="font-semibold text-gray-800 dark:text-gray-100">{contact.name}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{contact.email}</p>
        </div>
      </div>
      <div className="relative" ref={menuRef}>
        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 rounded-full focus:outline-none">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>
        </button>
        {isMenuOpen && (
          <div className="absolute right-0 mt-2 w-32 bg-white dark:bg-gray-800 rounded-md shadow-lg z-10 border border-gray-200 dark:border-gray-700">
            <button onClick={() => { onEdit(); setIsMenuOpen(false); }} className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">Edit</button>
            <button onClick={() => { onDelete(); setIsMenuOpen(false); }} className="block w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-gray-100 dark:hover:bg-gray-700">Delete</button>
          </div>
        )}
      </div>
    </div>
  );
};


const ContactsEmptyState: React.FC<{ onAdd: () => void }> = ({ onAdd }) => (
    <div className="text-center p-8 my-6 bg-white dark:bg-gray-800 rounded-2xl shadow-sm animate-fade-in-up">
        <div className="w-20 h-20 mx-auto bg-violet-100 dark:bg-violet-900/30 rounded-full flex items-center justify-center mb-5">
             <svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-violet-600 dark:text-violet-400"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">No Contacts Yet</h2>
        <p className="text-gray-500 dark:text-gray-400 max-w-xs mx-auto mb-6">
            Add contacts to easily manage shared expenses or invoices.
        </p>
        <button
            onClick={onAdd}
            className="py-3 px-6 bg-violet-600 text-white font-semibold rounded-lg shadow-md hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 transition-transform transform hover:scale-105"
        >
            Add First Contact
        </button>
    </div>
);


const Contacts: React.FC<ContactsProps> = ({ setActivePage, contacts, onAddContact, onUpdateContact, onDeleteContact }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [contactToEdit, setContactToEdit] = useState<Contact | null>(null);

  const handleOpenAddModal = () => {
    setContactToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (contact: Contact) => {
    setContactToEdit(contact);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setContactToEdit(null);
  };

  const handleSaveContact = (contactData: ContactFormData | Contact) => {
    if ('id' in contactData) {
      onUpdateContact(contactData as Contact);
    } else {
      onAddContact(contactData as ContactFormData);
    }
    handleCloseModal();
  };

  const handleDelete = (contactId: string) => {
    if (window.confirm('Are you sure you want to delete this contact?')) {
      onDeleteContact(contactId);
    }
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-full flex flex-col">
      <Header title="Contacts" />
      <div className="p-4 flex-1">
        <BackButton onClick={() => setActivePage(Page.SETTINGS)} text="Back to Settings" />

        {contacts.length > 0 ? (
          <>
            <div className="rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
              {contacts.map(contact => 
                <ContactItem 
                  key={contact.id} 
                  contact={contact}
                  onEdit={() => handleOpenEditModal(contact)}
                  onDelete={() => handleDelete(contact.id)}
                />
              )}
            </div>
            <button 
                onClick={handleOpenAddModal}
                className="w-full mt-6 py-3 px-4 flex items-center justify-center space-x-2 border border-transparent text-sm font-medium rounded-lg text-white bg-violet-600 hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                <span>Add New Contact</span>
            </button>
          </>
        ) : (
          <ContactsEmptyState onAdd={handleOpenAddModal} />
        )}
      </div>

      {isModalOpen && (
        <AddContactModal 
            onClose={handleCloseModal}
            onSave={handleSaveContact}
            contactToEdit={contactToEdit}
        />
      )}
    </div>
  );
};

export default Contacts;
