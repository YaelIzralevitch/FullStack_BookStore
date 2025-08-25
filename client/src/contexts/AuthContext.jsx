import { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUser, isTokenValid } from '../utils/localStorage';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const user = getUser();
    if(user){
      const isValid = isTokenValid();
      if (!isValid) {
        logout();
        navigate('/login')
        return;
      }
    }
    setCurrentUser(user);
    setLoading(false);
  }, []);

  const login = (user) => {
    setCurrentUser(user);
    localStorage.setItem('user', JSON.stringify(user));
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('authToken');
    localStorage.removeItem('cart');
  };


  const value = {
    currentUser,
    setCurrentUser,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;