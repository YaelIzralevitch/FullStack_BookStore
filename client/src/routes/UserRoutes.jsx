import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';
import UserLayout from '../layouts/UserLayout.jsx';
import HomePage from '../pages/user/home/HomePage.jsx';
//import Cart from '../pages/user/Cart';

function UserRoutes() {
  return (
    <ProtectedRoute role="user">
      <Routes>
        <Route path="/" element={<UserLayout />}>
          <Route index element={<HomePage />} />
          <Route path="home" element={<HomePage />} />
          <Route path="cart" element={<Cart />} />
        </Route>
      </Routes>
    </ProtectedRoute>
  );
}

export default UserRoutes;
