import React, { useState, useRef, useEffect } from 'react';
import './NavMenu.css';
function NavMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState('Home');
  const dropdownRef = useRef(null);

  const navigationOptions = [
    { label: 'Home', value: '/home', icon: '🏠' },
    { label: 'Shopping cart', value: '/', icon: '📚' },
    { label: 'Previous orders', value: '/', icon: '📖' },
    { label: 'Personal profile', value: '/', icon: '🔬' },
    { label: 'Logout', value: '/login', icon: '🏛️' },
  ];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleOptionClick = (option) => {
    setSelectedOption(option.label);
    setIsOpen(false);
    // Here you would typically navigate to the route
    console.log('Navigating to:', option.value);
    // For React Router: navigate(option.value);
  };

  return (
    <div className="dropdown-container" ref={dropdownRef}>
      <div 
        className={`dropdown-trigger ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="selected-value">
          <span className="selected-icon">
            {navigationOptions.find(opt => opt.label === selectedOption)?.icon}
          </span>
          {selectedOption}
        </span>
        <span className={`arrow ${isOpen ? 'up' : 'down'}`}>▼</span>
      </div>
      
      <div className={`dropdown-menu ${isOpen ? 'show' : ''}`}>
        {navigationOptions.map((option) => (
          <div
            key={option.value}
            className={`dropdown-item ${selectedOption === option.label ? 'selected' : ''}`}
            onClick={() => handleOptionClick(option)}
          >
            <span className="item-icon">{option.icon}</span>
            <span className="item-label">{option.label}</span>
          </div>
        ))}
      </div>
      </div>
  );
}

export default NavMenu;