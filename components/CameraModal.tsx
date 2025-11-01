import React, { useRef, useEffect, useState } from 'react';

interface CameraModalProps {
  onClose: () => void;
  onCapture: (imageDataUrl: string) => void;
}

const CameraModal: React.FC<CameraModalProps> = ({ onClose, onCapture }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    let activeStream: MediaStream | null = null;
    
    // Request camera access
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(stream => {
        activeStream = stream;
        setStream(stream);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      })
      .catch(err => {
        console.error("Error accessing camera: ", err);
        alert("Could not access the camera. Please check your browser permissions.");
        onClose();
      });

    // Cleanup function to stop the camera stream when the component unmounts
    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [onClose]);

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      // Set canvas dimensions to match the video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw the current video frame onto the canvas
      const context = canvas.getContext('2d');
      context?.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Convert the canvas image to a data URL
      const imageDataUrl = canvas.toDataURL('image/png');
      
      // Pass the captured image data to the parent component
      onCapture(imageDataUrl);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex flex-col items-center justify-center z-50">
      <video ref={videoRef} autoPlay playsInline className="w-full max-w-lg h-auto rounded-lg"></video>
      
      {/* A hidden canvas for capturing the image */}
      <canvas ref={canvasRef} className="hidden"></canvas>

      <div className="absolute bottom-10 flex space-x-4">
        <button
          onClick={handleCapture}
          className="w-20 h-20 bg-white rounded-full flex items-center justify-center border-4 border-gray-400 focus:outline-none"
          aria-label="Capture photo"
        >
            <div className="w-16 h-16 bg-white rounded-full active:bg-gray-300"></div>
        </button>
      </div>

      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white text-2xl font-bold"
        aria-label="Close camera"
      >
        &times;
      </button>
    </div>
  );
};

export default CameraModal;