import { useContext } from 'react';
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import AuthContext from '../../contexts/AuthContext';

function AdminLayout() {
  const { currentUser, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const navigationOptions = [
    { label: 'Dashboard', value: '/dashboard' },
    { label: 'Stock Management', value: '/dashboard/stockManagement' },
    { label: 'Orders', value: '/dashboard/orders' },
    { label: 'Logout', value: '/login' },
  ];

  const handleNavigation = (option) => {
    if (option.label === 'Logout') {
      // טיפול מיוחד ללוגאוט
      logout(); // אם יש פונקציית logout בcontext
      navigate('/login');
    } else {
      navigate(option.value);
    }
  };

  return (
    <>
      <header className="header">
        <div className="header-user">
          <img className="logo" src="/src/assets/" alt="Logo" />
          
          <h1>Hello Admin, {currentUser?.first_name}</h1>

          <div className="admin-nav">
            {navigationOptions.map((option, index) => (
              <button
                key={index}
                className={`admin-nav-btn ${location.pathname === option.value ? 'active' : ''} ${option.label === 'Logout' ? 'logout-btn' : ''}`}
                onClick={option.label === 'Logout' ? () => { logout(); handleNavigation(option);} : () => handleNavigation(option)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className='home-Outlet-container'>
        <Outlet />
      </main>

      <footer className="footer">
        <p>© 2025 BookStore. All rights reserved.</p>
      </footer>
    </>
  );
}

export default AdminLayout;