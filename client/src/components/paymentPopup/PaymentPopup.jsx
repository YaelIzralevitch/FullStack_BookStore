// components/PaymentPopup.jsx
import { useState, useEffect, useContext } from 'react';
import AuthContext from '../../contexts/AuthContext';
import { getUserCreditCard, addUserCreditCard, createOrder } from '../../services/api';
import './PaymentPopup.css';

function PaymentPopup({ orderData, onClose, onSuccess }) {
  const [savedCard, setSavedCard] = useState(null);
  const [useNewCard, setUseNewCard] = useState(false);
  const [saveCard, setSaveCard] = useState(false);
  
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpairy, setCardExpairy] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(false);

  const { currentUser } = useContext(AuthContext);

  useEffect(() => {
    async function fetchSavedCard() {
      if (!currentUser?.id) return;

      try {
        setLoading(true);
        const response = await getUserCreditCard(currentUser.id);
        
        if (response.success && response.data) {
          setSavedCard(response.data);
        } else {
          setSavedCard(null);
          setUseNewCard(true); // אין כרטיס שמור
        }
      } catch (err) {
        console.error('Error fetching saved card:', err);
        setUseNewCard(true);
      } finally {
        setLoading(false);
      }
    }

    fetchSavedCard();
  }, [currentUser]);

  const formatPrice = (price) => `$${parseFloat(price).toFixed(2)}`;

  const handlePayment = async () => {
    try {
      setError('');
      setProcessing(true);

      let paymentData;

      if (savedCard && !useNewCard) {
        // שימוש בכרטיס שמור
        paymentData = {
          savedCard: true
        };
      } else {
        // שימוש בכרטיס חדש
        if (!cardNumber || !cardExpairy || !cardCvv) {
          setError('Please fill in all payment fields');
          return;
        }

        paymentData = {
          savedCard: false,
          cardNumber,
          cardExpairy,
          cardCvv
        };

        // שמירת כרטיס אם נבחר
        if (saveCard) {
          try {
            await addUserCreditCard(currentUser.id, {
              cardNumber,
              cardExpairy,
              cardCvv
            });
          } catch (saveError) {
            console.error('Error saving card:', saveError);
            // ממשיכים עם התשלום גם אם שמירת הכרטיס נכשלה
          }
        }
      }

      // ביצוע התשלום
      const response = await createOrder(orderData, paymentData);

      if (response.success) {
        onSuccess(response.data);
      } else {
        setError(response.message || 'Payment failed. Please try again.');
      }

    } catch (err) {
      setError(err.message || 'Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="payment-overlay">
      <div className="payment-popup">
        <button className="close-btn" onClick={onClose}>×</button>
        
        <h2>Complete Payment</h2>
        
        <div className="order-summary-payment">
          <h3>Order Summary</h3>
          <div className="total-amount">
            Total: {formatPrice(orderData.totalPrice)}
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        {loading ? (
          <div className="loading">Loading payment options...</div>
        ) : (
          <div className="payment-content">
            {savedCard && (
              <div className="saved-card-option">
                <label className="payment-method-label">
                  <input
                    type="radio"
                    checked={!useNewCard}
                    onChange={() => setUseNewCard(false)}
                  />
                  <span>Use saved card **** **** **** {savedCard.lastFourDigits || savedCard}</span>
                </label>
              </div>
            )}

            <div className="new-card-option">
              <label className="payment-method-label">
                <input
                  type="radio"
                  checked={useNewCard}
                  onChange={() => setUseNewCard(true)}
                />
                <span>{savedCard ? 'Use different card' : 'Enter card details'}</span>
              </label>
            </div>

            {useNewCard && (
              <div className="new-card-form">
                <div className="form-group">
                  <label>Card Number</label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    placeholder="1234 5678 9012 3456"
                    disabled={processing}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Expiry Date</label>
                    <input
                      type="text"
                      value={cardExpairy}
                      onChange={(e) => setCardExpairy(e.target.value)}
                      placeholder="MM/YY"
                      disabled={processing}
                    />
                  </div>
                  <div className="form-group">
                    <label>CVV</label>
                    <input
                      type="text"
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value)}
                      placeholder="123"
                      disabled={processing}
                    />
                  </div>
                </div>
                {saveCard && (
                    <div className="save-card-option">
                    <label className="checkbox-label">
                        <input
                        type="checkbox"
                        checked={saveCard}
                        onChange={(e) => setSaveCard(e.target.checked)}
                        disabled={processing}
                        />
                        <span>Save this card for future purchases</span>
                    </label>
                    </div>
                    )}
              </div>
            )}

            <div className="payment-actions">
              <button
                className="payment-btn cancel-btn"
                onClick={onClose}
                disabled={processing}
              >
                Cancel
              </button>
              <button
                className="payment-btn pay-btn"
                onClick={handlePayment}
                disabled={processing}
              >
                {processing ? 'Processing...' : `Pay ${formatPrice(orderData.totalPrice)}`}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default PaymentPopup;