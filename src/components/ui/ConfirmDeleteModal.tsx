import React from 'react';
import { Modal } from './Modal';
import { AlertTriangle, Trash2 } from 'lucide-react';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  competitionName: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting?: boolean;
}

export const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  isOpen,
  competitionName,
  onConfirm,
  onCancel,
  isDeleting = false,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onCancel} title="Delete Competition?" maxWidth="md">
      <div className="space-y-4">
        <div className="flex items-start gap-3.5 bg-rose-500/10 border border-rose-500/20 p-4 rounded-xl">
          <AlertTriangle className="w-6 h-6 text-rose-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-sm text-slate-200">
              Are you sure you want to delete <span className="font-semibold text-white">"{competitionName}"</span>?
            </p>
            <p className="text-xs text-rose-300 font-medium">
              This action cannot be undone. All associated rounds and details will be permanently deleted.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={isDeleting}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="btn-danger"
          >
            <Trash2 className="w-4 h-4" />
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </Modal>
  );
};
