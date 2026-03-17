// ConfirmModal.tsx
import React from 'react';
import Modal from './Modal';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  children: React.ReactNode;
  confirmText?: string;
  message?: React.ReactNode;
  cancelText?: string;
  type?: 'success' | 'error'; 
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  children,
  confirmText = 'Подтвердить',
  cancelText = 'Отмена',
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} type="error">
      <div>
        <p>{children}</p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
          <button className="btn secondary-btn" onClick={onClose}>{cancelText}</button>
          <button className="btn delete-btn" onClick={onConfirm}>{confirmText}</button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmModal;
