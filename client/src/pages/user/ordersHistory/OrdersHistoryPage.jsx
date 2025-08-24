// pages/OrderHistoryPage.jsx
import { useState, useEffect, useContext, useRef} from 'react';
import AuthContext from '../../../contexts/AuthContext';
import { getUserOrderHistory } from '../../../services/api';
import './OrderHistoryPage.css';

function OrderHistoryPage() {
  const [orders, setOrders] = useState([]);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const { currentUser } = useContext(AuthContext);
  const hasFetched = useRef(false);

  useEffect(() => {
    async function fetchOrderHistory() {
      if (hasFetched.current || !currentUser?.id) return;

      hasFetched.current = true;

      try {
        setLoading(true);
        setError('');
        
        const response = await getUserOrderHistory(currentUser.id);
        
        if (response.success) {
          setOrders(response.data || []);
        } else {
          setError(response.message || 'Failed to fetch order history');
        }
      } catch (err) {
        setError(err.message || 'Failed to fetch order history');
        console.error('Error fetching order history:', err);
      } finally {
        setLoading(false);
      }
    }
    window.scrollTo({ top: 0 });
    fetchOrderHistory();
  }, [currentUser]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (price) => {
    return `$${parseFloat(price).toFixed(2)}`;
  };

  const getStatusClass = (status) => {
    return `status status-${status}`;
  };

  const toggleOrderExpansion = (orderId) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  if (loading) {
    return (
      <div className="order-history-container">
        <div className="loading">Loading order history...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="order-history-container">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="order-history-container">
      <h1>Order History</h1>
      
      {orders.length === 0 ? (
        <div className="no-orders">
          <p>You haven't placed any orders yet</p>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <div key={order.order_id} className="order-card">
              <div 
                className="order-summary-history"
                onClick={() => toggleOrderExpansion(order.order_id)}
              >
                <div className="order-info">
                <div>
                  <div className="order-date">
                    {formatDate(order.created_at)}
                  </div>
                  <div className="order-total">
                    {formatPrice(order.total_price)}
                  </div>
                  </div>
                  <div className={getStatusClass(order.order_status)}>
                    {order.order_status}
                  </div>
                </div>
                <div className="expand-icon">
                  {expandedOrderId === order.order_id ? '▼' : '▶'}
                </div>
              </div>

              {expandedOrderId === order.order_id && (
                <div className="order-details">
                  <div className="order-number">
                    Order Number: #{order.order_id}
                  </div>
                  
                  <div className="books-list">
                    {order.books.map((book, index) => (
                      <div key={`${book.book_id}-${index}`} className="book-item">
                        <div className="order-book">
                            <div className="book-image">
                            {book.image_url ? (
                                <img 
                                src={book.image_url} 
                                alt={book.title}
                                onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.nextSibling.style.display = 'flex';
                                }}
                                />
                            ) : null}
                            <div className="image-placeholder" style={{display: book.image_url ? 'none' : 'flex'}}>
                                📖
                            </div>
                            </div>
                            
                            <div className="order-book-details">
                            <h4>{book.title}</h4>
                            <p className="book-author">By: {book.author}</p>
                            {book.category_name && (
                                <p className="book-category">Category: {book.category_name}</p>
                            )}
                            </div>
                        </div>
                        
                        <div className="book-order-info">
                          <div className="quantity">Quantity: {book.quantity}</div>
                          <div className="unit-price">{formatPrice(book.unit_price)} each</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default OrderHistoryPage;