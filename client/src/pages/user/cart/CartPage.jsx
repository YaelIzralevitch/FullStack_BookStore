import { useState, useContext, useEffect} from 'react';
import CartContext from '../../../contexts/CartContext';
import AuthContext from '../../../contexts/AuthContext';
import PaymentPopup from '../../../components/paymentPopup/PaymentPopup';
import { useNavigate } from 'react-router-dom';
import './CartPage.css';

function CartPage() {
  const { cartItems, updateQuantity, removeFromCart, getCartTotal, clearCart } = useContext(CartContext);
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const [showPaymentPopup, setShowPaymentPopup] = useState(false);
  const [shippingAddress, setShippingAddress] = useState({
    street: currentUser?.street || '',
    city: currentUser?.city || '',
    house_number: currentUser?.house_number || '',
  });
  const [orderData, setOrderData] = useState({});
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    window.scrollTo({
      top: 0,
    });
  }, []);

  const formatPrice = (price) => `$${parseFloat(price).toFixed(2)}`;

  // חישוב הנחה
  const DISCOUNT_THRESHOLD = 200;
  const DISCOUNT_AMOUNT = 10;
  
  const subtotal = getCartTotal();
  const discount = subtotal >= DISCOUNT_THRESHOLD ? DISCOUNT_AMOUNT : 0;
  const finalTotal = subtotal - discount;

  const handleQuantityChange = (bookId, change) => {
    const item = cartItems.find(item => item.id === bookId);
    if (item) {
      const newQuantity = item.quantity + change;
      if (newQuantity > 0) {
        updateQuantity(bookId, newQuantity);
      }
    }
  };

  const handleAddressChange = (field, value) => {
    setError('');
    setShippingAddress(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCheckout = () => {
    setError('');
    if (cartItems.length === 0) {
      setError('Your cart is empty');
      return;
    }

    if (!shippingAddress.street || !shippingAddress.city || !shippingAddress.house_number) {
      setError('Please fill in all shipping address fields');
      return;
    }

    setOrderData({
        items: cartItems,
        subtotal: subtotal,
        discount: discount,
        totalPrice: finalTotal,
        shippingAddress
    });

    setShowPaymentPopup(true);
  };

  const handlePaymentSuccess = (paymentData) => {
    clearCart();
    setShowPaymentPopup(false);
    window.scrollTo({ top: 0 });
    setSuccessMessage(`Payment successful! Order #${paymentData.orderId} has been created.`);
    setTimeout(() => setSuccessMessage(''), 5000);
  };

  if (cartItems.length === 0) {
    return (
      <div className="cart-page">
        {successMessage && <div className="success-message">{successMessage}</div>}
        <div className="empty-cart">
          <h1>Your Cart</h1>
          <p>Your cart is empty</p>
          <button 
            className="continue-shopping-btn"
            onClick={() => navigate('/home')}
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <h1>Shopping Cart</h1>
        {error && <div className="error-message">{error}</div>}
        {successMessage && <div className="success-message">{successMessage}</div>}
      <div className="cart-content">
        {/* Cart Items - Left Side */}
        <div className="cart-items-section">
          <h2>Items in Cart ({cartItems.length})</h2>
          
          <div className="cart-items">
            {cartItems.map((item) => (
              <div key={item.id} className="cart-item">
                <div className="item-image">
                  {item.image_url ? (
                    <img 
                      src={item.image_url} 
                      alt={item.title}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div className="image-placeholder" style={{display: item.image_url ? 'none' : 'flex'}}>
                    📖
                  </div>
                </div>

                <div className="item-details">
                  <h3>{item.title}</h3>
                  <p className="item-author">By: {item.author}</p>
                  <p className="item-price">{formatPrice(item.price)} each</p>
                </div>

                <div className="quantity-controls">
                  <button 
                    className="quantity-btn"
                    onClick={() => handleQuantityChange(item.id, -1)}
                  >
                    -
                  </button>
                  <span className="quantity">{item.quantity}</span>
                  <button 
                    className="quantity-btn"
                    onClick={() => handleQuantityChange(item.id, 1)}
                  >
                    +
                  </button>
                </div>

                <div className="item-total">
                  {formatPrice(item.price * item.quantity)}
                </div>

                <button 
                  className="remove-btn"
                  onClick={() => removeFromCart(item.id)}
                  title="Remove from cart"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary & Shipping - Right Side */}
        <div className="checkout-section">
          <div className="order-summary">
            <h2>Order Summary</h2>
            <div className="summary-line">
              <span>Subtotal:</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            {discount > 0 && (
              <div className="summary-line discount">
                <span>Discount (Orders over {formatPrice(DISCOUNT_THRESHOLD)}):</span>
                <span>-{formatPrice(discount)}</span>
              </div>
            )}
            <div className="summary-line">
              <span>Shipping:</span>
              <span>Free</span>
            </div>
            <div className="summary-line total">
              <span>Total:</span>
              <span>{formatPrice(finalTotal)}</span>
            </div>
            {subtotal < DISCOUNT_THRESHOLD && subtotal > 0 && (
              <div className="discount-notice">
                💡 Add {formatPrice(DISCOUNT_THRESHOLD - subtotal)} more to get $10 off!
              </div>
            )}
          </div>

          <div className="shipping-address">
            <h3>Shipping Address</h3>
            <div className="address-form">
              <div className="form-group">
                <label>Street Address</label>
                <input
                  type="text"
                  value={shippingAddress.street}
                  onChange={(e) => handleAddressChange('street', e.target.value)}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>City</label>
                  <input
                    type="text"
                    value={shippingAddress.city}
                    onChange={(e) => handleAddressChange('city', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>House Number</label>
                  <input
                    type="text"
                    value={shippingAddress.house_number}
                    onChange={(e) => handleAddressChange('house_number', e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          <button 
            className="checkout-btn"
            onClick={handleCheckout}
          >
            Proceed to Payment
          </button>
        </div>
      </div>

      {showPaymentPopup && (
        <PaymentPopup
          orderData={orderData}
          onClose={() => setShowPaymentPopup(false)}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
}

export default CartPage;