import { useContext } from 'react';
import { Outlet} from "react-router-dom";
import { useNavigate } from 'react-router-dom';
import AuthContext from '../contexts/AuthContext';
import NavSearch from '../components/NavSearch/NavSearch';
import NavMenu from '../components/NavMenu/NavMenu';
import NavCart from '../components/NavCart/NavCart';
import './Layout.css'

function UserLayout() {

    const { currentUser } = useContext(AuthContext);
    const navigate = useNavigate();

    return (
    <>
     <header className="header">
      <div className="header-user">

        <img className="logo" src="\src\assets\bookstore-logo.png" alt="Logo" onClick={() => navigate('/home')}/>
        
        <h1>Hello, {currentUser?.first_name}</h1>
        
        <NavSearch />

        <NavMenu userId={currentUser.id}/>

        <NavCart userId={currentUser.id}/>

      </div>

      </header>

      <main className='home-Outlet-container'>
        <Outlet />
      </main>

      <footer className="footer">
        <div className='footer-icon'>
          <img src="/src/assets/icons-phone.png" alt="Phone Icon" />
          <p>058-6322589</p>
        </div>
        <div className='footer-icon'>
          <img src="/src/assets/icons-email.png" alt="Email Icon" />
          <p>BookStore25@gmail.com</p>
        </div>
        <p>© 2025 BookStore. All rights reserved.</p>
        
      </footer>
      
      </>
  );
}

export default UserLayout;
