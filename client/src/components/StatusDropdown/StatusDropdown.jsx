import React, { useState } from 'react';
import './StatusDropdown.css';

function StatusDropdown({ currentStatus, orderId, onStatusChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const statusOptions = [
    { value: 'paid', label: 'paid', color: '#10b981' },
    { value: 'cancelled', label: 'Cancelled', color: '#ef4444' }
  ];

  const getCurrentStatusConfig = () => {
    return statusOptions.find(option => option.value === currentStatus) || statusOptions[0];
  };

  const handleStatusSelect = async (newStatus) => {
    if (newStatus === currentStatus) {
      setIsOpen(false);
      return;
    }

    try {
      setIsUpdating(true);
      await onStatusChange(orderId, newStatus);
      setIsOpen(false);
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const currentConfig = getCurrentStatusConfig();

  return (
    <div className="status-dropdown-container">
      <button
        className={`status-dropdown-trigger ${currentStatus}`}
        onClick={() => setIsOpen(!isOpen)}
        disabled={isUpdating}
        style={{ backgroundColor: currentConfig.color }}
      >
        {isUpdating ? 'Updating...' : currentConfig.label}
        <span className="dropdown-arrow">▼</span>
      </button>

      {isOpen && (
        <div className="status-dropdown-menu">
          {statusOptions.map((option) => (
            <button
              key={option.value}
              className={`status-option ${option.value} ${option.value === currentStatus ? 'current' : ''}`}
              onClick={() => handleStatusSelect(option.value)}
              style={{ borderLeftColor: option.color }}
            >
              <span 
                className="status-color-indicator"
                style={{ backgroundColor: option.color }}
              ></span>
              {option.label}
              {option.value === currentStatus && <span className="current-indicator">✓</span>}
            </button>
          ))}
        </div>
      )}

      {isOpen && (
        <div 
          className="status-dropdown-overlay"
          onClick={() => setIsOpen(false)}
        ></div>
      )}
    </div>
  );
}

export default StatusDropdown;