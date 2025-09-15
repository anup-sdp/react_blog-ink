// src/components/Toast.jsx
import { useState } from 'react';

function Toast({ message, type = 'info', onClose }) {
  const [isVisible, setIsVisible] = useState(true);

  const handleClose = () => {
    setIsVisible(false);
    onClose();
  };

  if (!isVisible) return null;

  const bgColor = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    warning: 'bg-yellow-500',
    info: 'bg-blue-500',
  }[type];

  return (
    <div className={`fixed bottom-4 right-4 ${bgColor} text-white p-4 rounded-lg shadow-lg flex items-center space-x-4 z-50`}>
      <span>{message}</span>
      <button 
        onClick={handleClose}
        className="text-white hover:text-gray-200"
      >
        ✕
      </button>
    </div>
  );
}

export default Toast;