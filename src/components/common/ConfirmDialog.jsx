import { useState } from 'react';
import { AlertTriangle, Trash2 } from 'lucide-react';
import Modal from './Modal';

export default function ConfirmDialog({ isOpen, onClose, onConfirm, title, message, confirmText = 'Delete', loading = false }) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title || 'Confirm Action'}
      size="sm"
      footer={
        <>
          <button className="btn btn-secondary" onClick={onClose} disabled={loading}>Cancel</button>
          <button className="btn btn-danger" onClick={onConfirm} disabled={loading}>
            {loading ? (
              <span className="animate-spin" style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', display: 'inline-block' }} />
            ) : (
              <><Trash2 size={15} />{confirmText}</>
            )}
          </button>
        </>
      }
    >
      <div className="flex" style={{ gap: 16, alignItems: 'flex-start' }}>
        <div style={{ width: 44, height: 44, borderRadius: 10, background: 'var(--danger-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: 'var(--danger-500)' }}>
          <AlertTriangle size={22} />
        </div>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          {message || 'Are you sure you want to do this? This action cannot be undone.'}
        </p>
      </div>
    </Modal>
  );
}
