import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute.jsx';
import AdminLayout from '../layouts/AdminLayout.jsx';


function AdminRoutes() {
  return (
    <ProtectedRoute role="admin">
      <Routes>
        <Route path="/dashboard" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="books" element={<ManageBooks />} />
        </Route>
      </Routes>
    </ProtectedRoute>
  );
}

export default AdminRoutes;
