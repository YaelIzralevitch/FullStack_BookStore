import React from 'react';
import { Outlet, Link } from 'react-router-dom';

function AdminLayout() {
  return (
    <div>
      <h2>Admin Panel</h2>
      <nav>
        <Link to="/">Dashboard</Link> | <Link to="/books">Manage Books</Link>
      </nav>
      <hr />
      <Outlet />
    </div>
  );
}

export default AdminLayout;
