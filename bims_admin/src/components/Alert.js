import React from 'react';

const Alert = ({ show, type, message, onClose }) => {
  if (!show) return null;

  const getAlertStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm w-full">
      <div className={`rounded-lg border p-4 shadow-lg ${getAlertStyles()}`}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium">{message}</p>
          </div>
          <button
            onClick={onClose}
            className="ml-3 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <span className="sr-only">Close</span>
            <div className="w-4 h-4 flex items-center justify-center">
              <div className="w-3 h-0.5 bg-current transform rotate-45"></div>
              <div className="w-3 h-0.5 bg-current transform -rotate-45 absolute"></div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Alert;
