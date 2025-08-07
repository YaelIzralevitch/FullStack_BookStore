
import './App.css'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import LoginPage from './pages/login/loginPage.jsx';
import RegisterPage from './pages/register/RegisterPage.jsx';
/*
import CompleteRegistrationPage from './pages/CompleteRegistrationPage';
import HomePage from './pages/HomePage';
import TodosPage from './pages/TodosPage';
import PostsPage from './pages/PostsPage';
import PostPage from './pages/PostPage';
import AlbumsPage from './pages/AlbumsPage';
import HomeLayout from './components/HomeLayout';
import PhotosPage from './pages/PhotosPage';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorPage from './pages/ErrorPage';
*/

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
         
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
       </Routes>
    
    
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;