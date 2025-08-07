import React from 'react';
import { Outlet, Link } from 'react-router-dom';

function UserLayout() {
  return (
    <div>
      <h2>Book Store</h2>
      <nav>
        <Link to="/">Home</Link> | <Link to="/cart">Cart</Link>
      </nav>
      <hr />
      <Outlet />
    </div>
  );
}

export default UserLayout;
