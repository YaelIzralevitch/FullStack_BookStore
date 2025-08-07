import React, { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from '../pages/login/loginPage.jsx';
import RegisterPage from '../pages/register/RegisterPage.jsx';
import UserLayout from '../layouts/UserLayout.jsx';
import HomePage from '../pages/user/home/HomePage.jsx';
// import Cart from '../pages/user/Cart';
import AdminLayout from '../layouts/AdminLayout.jsx';
import DashboardPage from '../pages/admin/DashboardPage.jsx';
import AuthContext from '../contexts/AuthContext.jsx';

function AppRoutes() {
  const { currentUser } = useContext(AuthContext);

  // If user is logged in, show appropriate routes based on role
  if (currentUser?.role === 'client') {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/home" element={<UserLayout />}>
          <Route index element={<HomePage />} />
          {/* 
          <Route path="cart" element={<CartPage />} />
          <Route path="ordersHistory" element={<OrdersHistoryPage />} />
          <Route path="userDetails/:userID" element={<UserDetailsPage />} />
          <Route path='categories/:category' element={<BooksPage />} />
          <Route path='categories/:category/books/:bookID' element={<BookDetailsPage />} />
          */}
        </Route>
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  if (currentUser?.role === 'admin') {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/dashboard" element={<AdminLayout />}>
          <Route index element={<DashboardPage />} />
          {/*
          <Route path="stockManagement" element={<StockManagementPage />} />
          <Route path='orders' element={<OrdersPage />} />
          */}
        </Route>
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  // If no user is logged in, show only login/register
  return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
}

export default AppRoutes;