// HotelPro - Reusable Dismissible Alert Component
import React from 'react';

const AlertMessage = ({ type = 'danger', message, onClose }) => {
  if (!message) return null;

  return (
    <div
      className={`alert alert-${type} alert-dismissible fade show shadow-sm d-flex align-items-center`}
      role="alert"
    >
      <i
        className={`bi ${
          type === 'success'
            ? 'bi-check-circle-fill'
            : type === 'warning'
            ? 'bi-exclamation-triangle-fill'
            : 'bi-exclamation-octagon-fill'
        } me-2 fs-5`}
      ></i>
      <div className="flex-grow-1">{message}</div>
      {onClose && (
        <button
          type="button"
          className="btn-close"
          aria-label="Close"
          onClick={onClose}
        ></button>
      )}
    </div>
  );
};

export default AlertMessage;
