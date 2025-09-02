import { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LS from '../utils/localStorage';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const user = LS.getUser();
    if(user){
      const isValid = LS.isTokenValid();
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
    LS.saveUser(user);
  };

  const logout = () => {
    setCurrentUser(null);
    LS.removeUser();
    LS.removeAuthToken();
    LS.clearCart();
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