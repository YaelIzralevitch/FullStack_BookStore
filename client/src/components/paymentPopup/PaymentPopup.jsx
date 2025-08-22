// components/PaymentPopup.jsx
import { useState, useEffect, useContext } from 'react';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import AuthContext from '../../contexts/AuthContext';
import { getUserCreditCard, createOrder } from '../../services/api';
import './PaymentPopup.css';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

function PaymentForm({ orderData, onClose, onSuccess }) {
  const stripe = useStripe();
  const elements = useElements();
  const [savedCard, setSavedCard] = useState(null);
  const [useNewCard, setUseNewCard] = useState(false);
  const [saveCard, setSaveCard] = useState(false);

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
    if (!stripe || !elements) {
      setError('Stripe is not loaded yet. Please try again.');
      return;
    }

    try {
      setError('');
      setProcessing(true);

      let paymentData;

      if (savedCard && !useNewCard) {
        // שימוש בכרטיס שמור
        paymentData = {
          useSavedCard: true,
          saveNewCard: false
        };
      } else {
        // שימוש בכרטיס חדש
        const cardElement = elements.getElement(CardElement);

        if (!cardElement) {
          setError('Please enter card details');
          return;
        }

        // צור Payment Method עם Stripe
        const { error, paymentMethod } = await stripe.createPaymentMethod({
          type: 'card',
          card: cardElement,
        });

        if (error) {
          setError(error.message);
          return;
        }

        paymentData = {
          useSavedCard: false,
          saveNewCard: saveCard,
          paymentMethodId: paymentMethod.id
        };
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

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        '::placeholder': {
          color: '#aab7c4',
        },
        padding: '12px',
      },
      invalid: {
        color: '#9e2146',
      },
    },
    hidePostalCode: true,
    wallets: { applePay: false, googlePay: false },
    disableLink: true,
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
                  <span>
                    Use saved card {savedCard.card_brand?.toUpperCase()} **** **** **** {savedCard.card_last_four || savedCard.lastFourDigits || savedCard}
                  </span>
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
                  <label>Card Details</label>
                  <div className="stripe-card-element">
                    <CardElement options={cardElementOptions} />
                  </div>
                </div>

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
                disabled={processing || !stripe}
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

// הקומפוננטה הראשית עם Elements Provider
function PaymentPopup({ orderData, onClose, onSuccess }) {
  return (
    <Elements stripe={stripePromise}>
      <PaymentForm 
        orderData={orderData}
        onClose={onClose}
        onSuccess={onSuccess}
      />
    </Elements>
  );
}

export default PaymentPopup;