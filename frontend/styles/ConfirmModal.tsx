
import './ConfirmModal.css';

interface ConfirmModalProps {
  message: string;
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmModal = ({ message, isOpen, onConfirm, onCancel }: ConfirmModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="confirm-modal-overlay">
      <div className="confirm-modal">
        <p>{message}</p>
        <div className="confirm-modal-actions">
          <button className="confirm-btn" onClick={onConfirm}>Да</button>
          <button className="cancel-btn" onClick={onCancel}>Нет</button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
