import { useState, useRef, useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import AuthContext from '../../contexts/AuthContext';
import './NavMenu.css';

function NavMenu({ userId }) {
  const navigationOptions = [
    { label: 'Home', value: '/home' },
    { label: 'Shopping cart', value: '/home/cart'},
    { label: 'Previous orders', value: '/home/ordersHistory' },
    { label: 'Personal profile', value: `/home/userDetails/${userId}` },
    { label: 'Logout', value: '/login' },
  ];
  
  const { logout } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // פונקציה לקביעת האופציה הנוכחית על בסיס ה-location
  const getCurrentOption = () => {
    const match = navigationOptions.find(opt => location.pathname === opt.value);
    return match ? match.label : 'Home';
  };

  const [selectedOption, setSelectedOption] = useState(getCurrentOption());

  // עדכן את האופציה הנבחרת כאשר ה-location משתנה
  useEffect(() => {
    const currentOption = getCurrentOption();
    setSelectedOption(currentOption);
  }, [location.pathname, userId]);

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
    
    if (option.label === 'Logout') {
      logout();
      navigate(option.value);
    } else {
      navigate(option.value);
    }
  };

  return (
    <div className="dropdown-container" ref={dropdownRef}>
      <div 
        className={`dropdown-trigger ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="selected-value">
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
            <span className="item-label">{option.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default NavMenu;