import React, { useRef, useState } from 'react';
import { Page } from '../types';
import BackButton from './common/BackButton';
import ConfirmationModal from './ConfirmationModal';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera'; // This import is correct for both v5 and v7

interface ProfilePhotoProps {
  setActivePage: (page: Page) => void;
  currentPhoto: string | null;
  onPhotoChange: (photo: string | null) => void;
  userName: string;
}

const ProfilePhoto: React.FC<ProfilePhotoProps> = ({ setActivePage, currentPhoto, onPhotoChange, userName }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false); // This is no longer used, but we'll keep it for structure
  const [isRemoveConfirmOpen, setIsRemoveConfirmOpen] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleTakePhoto = async () => {
    try {
        // Request permission first, which is good practice
        const permission = await Camera.requestPermissions();
        if (permission.camera !== 'granted') {
            alert('Camera permission is required to take a photo.');
            return;
        }

        const image = await Camera.getPhoto({
            quality: 90,
            allowEditing: true,
            resultType: CameraResultType.DataUrl,
            source: CameraSource.Camera
        });
        
        if (image.dataUrl) {
            setPreviewPhoto(image.dataUrl);
        }
    } catch (error) {
        console.warn("Camera failed or was cancelled:", error);
    }
  };

  const handleSave = () => {
    onPhotoChange(previewPhoto);
    setActivePage(Page.SETTINGS);
  };

  const handleCancel = () => {
    setPreviewPhoto(null);
  };
  
  const handleRemovePhoto = () => {
    setIsRemoveConfirmOpen(true);
  };
  
  const confirmRemovePhoto = () => {
    onPhotoChange(null);
    setIsRemoveConfirmOpen(false);
    setActivePage(Page.SETTINGS);
  };

  const displayPhoto = previewPhoto === '' ? null : previewPhoto || currentPhoto;

  return (
    <>
      <div className="bg-gray-50 dark:bg-gray-900 min-h-full flex flex-col p-4">
        <BackButton onClick={() => setActivePage(Page.SETTINGS)} text="Back to Settings" />
        
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <div className="relative w-40 h-40 mb-8 rounded-full ring-4 ring-white dark:ring-gray-800">
            {displayPhoto ? (
              <img src={displayPhoto} alt="Profile" className="w-full h-full rounded-full object-cover" />
            ) : (
              <div className="w-full h-full rounded-full bg-violet-600 flex items-center justify-center text-white text-6xl font-bold">
                {userName.charAt(0)}
              </div>
            )}
          </div>
          
          <div className="w-full max-w-xs space-y-4">
              {previewPhoto || previewPhoto === '' ? (
                  <>
                      <button 
                          onClick={handleSave}
                          className="w-full flex items-center justify-center space-x-3 py-3 px-4 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 transition-colors"
                      >
                          <span>Save Changes</span>
                      </button>
                      <button 
                          onClick={handleCancel}
                          className="w-full flex items-center justify-center space-x-3 py-3 px-4 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-semibold rounded-lg shadow-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                      >
                          <span>Cancel</span>
                      </button>
                  </>
              ) : (
                  <>
                      <button 
                          onClick={() => fileInputRef.current?.click()}
                          className="w-full flex items-center justify-center space-x-3 py-3 px-4 bg-violet-600 text-white font-semibold rounded-lg shadow-md hover:bg-violet-700 transition-colors"
                      >
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                          <span>Upload Photo</span>
                      </button>
                      <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                      
                      <button 
                          onClick={handleTakePhoto}
                          className="w-full flex items-center justify-center space-x-3 py-3 px-4 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 font-semibold rounded-lg shadow-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-700"
                      >
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 9a2 2 0 0 1 2-2h.93a2 2 0 0 0 1.664-.89l.812-1.22A2 2 0 0 1 10.07 4h3.86a2 2 0 0 1 1.664.89l.812 1.22A2 2 0 0 0 18.07 7H19a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9z" /><circle cx="12" cy="13" r="3"></circle></svg>
                          <span>Take Photo</span>
                      </button>
                      
                      {currentPhoto && (
                        <button 
                            onClick={handleRemovePhoto}
                            className="w-full flex items-center justify-center space-x-3 py-2 px-4 text-sm text-red-500 bg-red-50 dark:bg-red-500/10 rounded-lg hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors"
                        >
                            <span>Remove Current Photo</span>
                        </button>
                      )}
                  </>
              )}
          </div>
        </div>
      </div>
      
      {/* The CameraModal is no longer needed because Capacitor's getPhoto opens the native camera UI */}
      
      {isRemoveConfirmOpen && (
        <ConfirmationModal
            isOpen={isRemoveConfirmOpen}
            title="Remove Photo"
            message="Are you sure you want to remove your profile photo?"
            onConfirm={confirmRemovePhoto}
            onCancel={() => setIsRemoveConfirmOpen(false)}
            confirmText="Remove"
        />
      )}
    </>
  );
};

export default ProfilePhoto;