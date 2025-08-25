import { useState, useEffect, useRef } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { getUserCreditCard, deleteUserCreditCard } from '../../services/api';
import CreditCardForm from './CreditCardForm.jsx';
import './CreditCardPopup.css';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

function CreditCardPopup({ userId, setShowCreditCardPopup }) {
  const [savedCard, setSavedCard] = useState(null);  
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const hasFetched = useRef(false);

  useEffect(() => {
    async function fetchUserCreditCard() {
      try {
        setLoading(true);
        const response = await getUserCreditCard(userId);
        if (response.success && response.data) {
          setSavedCard(response.data);
        } else {
          setSavedCard(null); // No credit card
        }
      } catch (err) {
        setError(err.message || 'Failed to fetch user credit card details');
      } finally {
        setLoading(false);
      }   
    }

    if (!hasFetched.current && userId) {
      fetchUserCreditCard();
    }
  }, [userId]);

  async function handleDelete() {
    try {
      setError('');
      setSuccessMessage('');
      setLoading(true);
      
      const response = await deleteUserCreditCard(userId);
      
      if (response.success) {
        setSavedCard(null);
        setSuccessMessage('Credit card deleted successfully');
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setError(response.message || 'Failed to delete credit card');
      }
      
    } catch (err) {
      setError(err.message || 'Failed to delete credit card');
    } finally {
      setLoading(false);
    }
  }

  const formatCardDisplay = (card) => {
    const brand = card.card_brand ? card.card_brand.toUpperCase() : '';
    const lastFour = card.card_last_four || card.lastFourDigits || card;
    const expiry = card.card_exp_month && card.card_exp_year 
      ? ` • Expires ${card.card_exp_month.toString().padStart(2, '0')}/${card.card_exp_year}`
      : '';
    
    return `${brand} **** **** **** ${lastFour}${expiry}`;
  };

  return (
    <Elements stripe={stripePromise}>
      <div className="popup-overlay">
        <div className="credit-card-popup">
          <button 
            id="close-btn" 
            onClick={() => setShowCreditCardPopup(false)}
            aria-label="Close"
          >
            ×
          </button>
          
          <h2>Credit Card Management</h2>
          
          {error && <div className="error-message">{error}</div>}
          {successMessage && <div className="success-message">{successMessage}</div>}
          {loading && <div className="loading">Loading...</div>}
          
          {savedCard ? (
              <div className="saved-card">
                <h3>Saved Credit Card</h3>
                <p className="card-details">
                  {formatCardDisplay(savedCard)}
                </p>
                <button 
                  className="popup-btn btn-delete" 
                  onClick={handleDelete} 
                  disabled={loading}
                >
                  {loading ? 'Deleting...' : 'Delete Card'}
                </button>
              </div>
            ) : (
              <CreditCardForm
                userId={userId}
                setSavedCard={setSavedCard}
                setError={setError}
                setSuccessMessage={setSuccessMessage}
                setLoading={setLoading}
                loading={loading}
              />
            )}
        </div>
      </div>
    </Elements>
  );
}

export default CreditCardPopup;