"use client";

import { useState, useEffect } from 'react';
import { CheckIcon, XIcon } from 'lucide-react';

interface FloatingNotificationProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

export default function FloatingNotification({
  message,
  type = 'success',
  isVisible,
  onClose,
  duration = 5000
}: FloatingNotificationProps) {
  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  if (!isVisible) return null;

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-green-600 text-white';
      case 'error':
        return 'bg-red-600 text-white';
      case 'info':
        return 'bg-blue-600 text-white';
      default:
        return 'bg-green-600 text-white';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckIcon className="h-5 w-5" />;
      case 'error':
        return <XIcon className="h-5 w-5" />;
      case 'info':
        return <CheckIcon className="h-5 w-5" />;
      default:
        return <CheckIcon className="h-5 w-5" />;
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-full duration-300">
      <div className={`flex items-center space-x-2 px-4 py-3 rounded-lg shadow-lg max-w-sm ${getTypeStyles()}`}>
        {getIcon()}
        <span className="text-sm font-medium">{message}</span>
        <button
          onClick={onClose}
          className="ml-2 opacity-70 hover:opacity-100 transition-opacity"
        >
          <XIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}