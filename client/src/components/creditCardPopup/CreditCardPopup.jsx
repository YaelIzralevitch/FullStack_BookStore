import React, { useState, useEffect } from 'react';
import { getUserCreditCard, deleteUserCreditCard, addUserCreditCard } from '../../services/api';
import './CreditCardPopup.css';

function CreditCardPopup({ userId, setShowCreditCardPopup }) {
  const [savedCard, setSavedCard] = useState(null);  

  const [cardNumber, setCardNumber] = useState('');
  const [expiresMonth, setExpiresMonth] = useState('');
  const [expiresYear, setExpiresYear] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
        async function fetchUserCreditCard() {
            try {
                setLoading(true);
                const response = await getUserCreditCard(userId);
                if (response.success && response.data) {
                    setSavedCard(response.data);
                } else {
                    setSavedCard(null); // אין כרטיס
                }
                
            } catch (err) {
                setError(err.message || 'Failed to fetch user credit card details');
            } 
            finally {
                
                setLoading(false);
            }   
        }

        if (userId) {
            fetchUserCreditCard();
        }
  
      }, [userId]);


  async function handleAdd(e) {
    e.preventDefault();
    try {

        setError('');
        setSuccessMessage('');
      if (!cardNumber || !expiresMonth || !expiresYear || !cardCvv) {
        setError('Please fill in all fields');
        return;
      }

      const cardExpairy = `${expiresMonth.padStart(2, '0')}/${expiresYear.slice(-2)}`;
    setLoading(true);
    await addUserCreditCard(userId, { cardNumber, cardExpairy, cardCvv });

    setSuccessMessage('Credit card added successfully');
    setTimeout(() => setSuccessMessage(''), 3000);
    setSavedCard(cardNumber.slice(-4)); // Save last 4 digits
    setCardNumber('');
    setExpiresMonth('');
    setExpiresYear('');
    setCardCvv('');
    } catch (err) {
      setError(err.message || 'Failed to add credit card');
    }
    finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    try {
      setError('');
      setSuccessMessage('');
      setLoading(true);
      
      await deleteUserCreditCard(userId);
      setSavedCard(null); // 🔧 עדכן state במקום לרענן את הדף
      setSuccessMessage('Credit card deleted successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
      
    } catch (err) {
      setError(err.message || 'Failed to delete credit card');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="popup-overlay">
      <div className="credit-card-popup">
        <button 
          className="close-btn" 
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
            <p>{`**** **** **** ${savedCard.lastFourDigits || savedCard}`}</p>
            <button className="popup-btn btn-delete" onClick={handleDelete} disabled={loading}>
              {loading ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        ) : (
          !loading && (
            <div>
              <h3>Add Credit Card</h3>
              <form onSubmit={handleAdd} className="credit-card-form">
                <input value={cardNumber} onChange={e => setCardNumber(e.target.value)} placeholder="0000-0000-0000" disabled={loading}/>
                <div className="form-row">
                  <input value={expiresMonth} onChange={e => setExpiresMonth(e.target.value)} placeholder="MM" disabled={loading}/>
                  <input value={expiresYear} onChange={e => setExpiresYear(e.target.value)} placeholder="YYYY" disabled={loading}/>
                </div>
                <input value={cardCvv} onChange={e => setCardCvv(e.target.value)} placeholder="CVV" disabled={loading}/>
                <button className="popup-btn btn-add" type="submit" disabled={loading}>
                  {loading ? 'Adding...' : 'Add'}
                </button>
              </form>
            </div>
          )
        )}
      </div>
    </div>
  );
}

export default CreditCardPopup;
