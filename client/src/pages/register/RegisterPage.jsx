import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Register } from '../../services/api';
import './RegisterPage.css';

const RegisterPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVerify, setPasswordVerify] = useState('');
  const [first_name, setFirst_name] = useState('');
  const [last_name, setLast_name] = useState('');
  const [phone, setPhone] = useState('');
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    window.scrollTo({
      top: 0,
    });
    
    // Check for empty fields
    if (!email.trim() || !password.trim() || !passwordVerify.trim() || !first_name.trim() || !last_name.trim() || !phone.trim()) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }
    
    // Check if passwords match
    if (password !== passwordVerify) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }
    
    try {
      // Check if username already exists
      await Register({ email, password, first_name, last_name, phone });
      
      alert('Registration successful! Please log in.');
      navigate('/login');
      
    }catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    }
    finally {
      setLoading(false);
   }
  };

  return (
    <div className="register-container">
      <div className="register-form">
        <h2>Register</h2>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className='form-fields'>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                autoComplete="email"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                autoComplete="new-password"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="password-verify">Confirm Password</label>
              <input
                type="password"
                id="password-verify"
                value={passwordVerify}
                onChange={(e) => setPasswordVerify(e.target.value)}
                disabled={loading}
                autoComplete="new-password"
              />
            </div>

            <div className="form-group">
              <label htmlFor="first_name">First Name</label>
              <input
                type="text"
                id="first_name"
                name="first_name"
                value={first_name}
                onChange={(e) => setFirst_name(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="last_name">Last Name</label>
              <input
                type="text"
                id="last_name"
                name="last_name"
                value={last_name}
                onChange={(e) => setLast_name(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone">Phone</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                pattern='^\d{7,15}$'
                disabled={loading}
              />
            </div> 
          </div>
          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>
        
        <div className="login-link">
          Already have an account? <Link to="/login">Login here</Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
