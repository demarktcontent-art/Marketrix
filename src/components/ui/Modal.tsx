import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
}

export function Modal({ isOpen, onClose, title, children, className }: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden bg-black/50 p-4 sm:p-0">
      <div 
        className="fixed inset-0 transition-opacity" 
        onClick={onClose}
        aria-hidden="true"
      />
      
      <div className={cn("relative w-full max-w-lg transform rounded-xl bg-white p-6 text-left shadow-xl transition-all sm:my-8", className)}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-semibold leading-6 text-gray-900">
            {title}
          </h3>
          <button
            type="button"
            className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            onClick={onClose}
          >
            <span className="sr-only">Close</span>
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
        
        <div className="mt-2">
          {children}
        </div>
      </div>
    </div>
  );
}
