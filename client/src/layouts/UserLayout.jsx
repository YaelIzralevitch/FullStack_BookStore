import { useContext } from 'react';
import { Outlet} from "react-router-dom";
import AuthContext from '../contexts/AuthContext';
import NavSearch from '../components/NavSearch';
import NavMenu from '../components/NavMenu/NavMenu';
import NavCart from '../components/NavCart';

function UserLayout() {

    const { currentUser } = useContext(AuthContext);

    return (
    <>
     <header className="header">
      <div className="header-user">

        <img className="logo" src="/src/assets/" alt="Logo" />
        
        <h1>Hello, {currentUser?.name}</h1>
        
        <NavSearch />

        <NavMenu />

        <NavCart />

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

export default UserLayout;
