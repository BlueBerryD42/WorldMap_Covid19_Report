
import React from 'react';
import './Dialog.css';

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const Dialog: React.FC<DialogProps> = ({ isOpen, onClose, children }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="dialog-overlay" onClick={onClose}>
      <div className="dialog-content" onClick={(e) => e.stopPropagation()}>
        {children}
        <button className="dialog-close-button" onClick={onClose}>
          &times;
        </button>
      </div>
    </div>
  );
};

export default Dialog;
