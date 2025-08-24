import './StatusDropdown.css';

function StatusDropdown({ currentStatus, orderId, onStatusChange }) {
  const statusOptions = [
    { value: 'paid', label: 'Paid', color: '#10b981' },
    { value: 'cancelled', label: 'Cancelled', color: '#ef4444' }
  ];

  const handleChange = async (e) => {
    const newStatus = e.target.value;
    if (newStatus === currentStatus) return;

    try {
      await onStatusChange(orderId, newStatus);
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  return (
    <select
      className={`status-select ${currentStatus}`}
      value={currentStatus}
      onChange={handleChange}
      onClick={(e) => e.stopPropagation()}
    >
      {statusOptions.map((option) => (
        <option 
          key={option.value} 
          value={option.value}
          style={{ color: option.color }}
        >
          {option.label}
        </option>
      ))}
    </select>
  );
}

export default StatusDropdown;
