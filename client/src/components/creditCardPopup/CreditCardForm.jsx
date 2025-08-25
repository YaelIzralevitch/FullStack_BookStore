import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { saveUserCreditCard } from '../../services/api';


function CreditCardForm({ userId, setSavedCard, setError, setSuccessMessage, setLoading, loading }) {
  const stripe = useStripe();
  const elements = useElements();

  const handleSaveCard = async (e) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      setError('Stripe is not loaded yet. Please try again.');
      return;
    }

    try {
      setError('');
      setSuccessMessage('');
      setLoading(true);

      const cardElement = elements.getElement(CardElement);

      if (!cardElement) {
        setError('Please enter card details');
        return;
      }
      
      // Create a Payment Method with Stripe
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
      });
      
      
      if (error) {
        setError(error.message);
        return;
      }

      // Send the Payment Method to the server
      const response = await saveUserCreditCard(userId, {
        paymentMethodId: paymentMethod.id
      });

      if (response.success) {
        setSavedCard({
          card_last_four: paymentMethod.card.last4,
          card_brand: paymentMethod.card.brand,
          card_exp_month: paymentMethod.card.exp_month,
          card_exp_year: paymentMethod.card.exp_year
        });
        setSuccessMessage('Credit card saved successfully');
        setTimeout(() => setSuccessMessage(''), 3000);
        
        cardElement.clear();
      } else {
        setError(response.message || 'Failed to save credit card');
      }

    } catch (err) {
      setError(err.message || 'Failed to save credit card');
    } finally {
      setLoading(false);
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
    <div>
      <h3>Add Credit Card</h3>
      <form onSubmit={handleSaveCard} className="credit-card-form">
        <div className="form-group">
          <label>Card Details</label>
          <div className="stripe-card-element">
            <CardElement options={cardElementOptions} />
          </div>
        </div>
        
        <button 
          className="popup-btn btn-add" 
          type="submit" 
          disabled={loading || !stripe}
        >
          {loading ? 'Saving...' : 'Save Card'}
        </button>
      </form>
    </div>
  );
}

export default CreditCardForm;