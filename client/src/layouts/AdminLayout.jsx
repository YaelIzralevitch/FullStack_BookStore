import { useContext } from 'react';
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import AuthContext from '../contexts/AuthContext';
import './Layout.css'

function AdminLayout() {
  const { currentUser, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const navigationOptions = [
    { label: 'Dashboard', value: '/admin' },
    { label: 'Stock Management', value: '/admin/stockManagement' },
    { label: 'Orders', value: '/admin/orders' },
  ];

  const handleNavigation = (option) => {
    if (option.label === 'Logout') {
      logout();
      navigate('/login');
    } else {
      navigate(option.value);
    }
  };

  return (
    <>
      <header className="header">
        <div className="header-admin">
          <div className='header-logo-hello'>
            <img className="logo" src="\src\assets\bookstore-logo.png" alt="Logo" onClick={() => navigate('/admin')}/>
            <h1>Hello Admin, {currentUser?.first_name}</h1>
          </div>

          <div className="admin-nav">
            {navigationOptions.map((option, index) => (
              <button
                key={index}
                className={`admin-nav-btn ${location.pathname === option.value ? 'active' : ''}`}
                onClick={() => handleNavigation(option)}
              >
                {option.label}
              </button>
            ))}
          </div>
          <button
                className='admin-nav-btn logout-btn'
                onClick={ () => { logout(); navigate("/login");} }
              >
                Logout
              </button>
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