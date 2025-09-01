import { useState, useEffect, useCallback, useRef } from 'react';
import debounce from 'lodash.debounce';
import { getOrdersForAdmin, updateOrderStatus } from '../../../services/api';
import StatusDropdown from '../../../components/StatusDropdown/StatusDropdown';
import './OrdersPage.css';

function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filters and search
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('DESC');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(null);

  const hasFetched = useRef(false);
  
  // Cache system
  const cache = useRef(new Map());
  const currentCacheKey = useRef(null);

  // Generate cache key based on current filters
  const generateCacheKey = () => {
    return `${searchTerm}|${statusFilter}|${sortBy}|${sortOrder}`;
  };

  // Clear entire cache
  const clearCache = () => {
    cache.current.clear();
  };

  // Get data from cache
  const getCachedData = (cacheKey, page) => {
    const cacheGroup = cache.current.get(cacheKey);
    return cacheGroup ? cacheGroup.get(page) : null;
  };

  // Store data in cache
  const setCachedData = (cacheKey, page, data) => {
    if (!cache.current.has(cacheKey)) {
      cache.current.set(cacheKey, new Map());
    }
    cache.current.get(cacheKey).set(page, {
      ...data,
      timestamp: Date.now()
    });
  };

  // Clear cache when component unmounts or when user leaves
  useEffect(() => {
    return () => {
      clearCache();
    };
  }, []);

  // Delay in sending the request only for the search
  const debouncedSearch = useCallback(
    debounce((value) => {
      setSearchTerm(value);
      setCurrentPage(1);
      clearCache(); // Clear cache when search changes
    }, 500),
    []
  );

  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  useEffect(() => {
    window.scrollTo({
      top: 0,
    });
  }, [currentPage]);

  useEffect(() => {
    if (!hasFetched.current) {
      hasFetched.current = true;
      fetchOrders();
    }
  }, []);
  
  useEffect(() => {
    if (totalCount !== null) {
      const newCacheKey = generateCacheKey();
      
      // If cache key changed (filters/sorting changed), clear cache
      if (currentCacheKey.current && currentCacheKey.current !== newCacheKey) {
        clearCache();
      }
      
      currentCacheKey.current = newCacheKey;
      fetchOrders();
    }
  }, [currentPage, statusFilter, sortBy, sortOrder, searchTerm]); 

  const fetchOrders = async () => {
    const cacheKey = generateCacheKey();
    const cachedData = getCachedData(cacheKey, currentPage);
    
    // Check if we have valid cached data
    if (cachedData) {
      setOrders(cachedData.orders);
      setTotalPages(cachedData.totalPages);
      setTotalCount(cachedData.totalCount);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const params = {
        search: searchTerm,
        status: statusFilter,
        sortBy,
        sortOrder,
        page: currentPage,
        limit: 10
      };

      const response = await getOrdersForAdmin(params);
      
      if (response.success) {
        const responseData = {
          orders: response.data.orders,
          totalPages: response.data.totalPages,
          totalCount: response.data.totalCount
        };
        
        // Cache the response
        setCachedData(cacheKey, currentPage, responseData);
        
        setOrders(responseData.orders);
        setTotalPages(responseData.totalPages);
        setTotalCount(responseData.totalCount);
      } else {
        setError(response.message || 'Failed to fetch orders');
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch orders');
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const response = await updateOrderStatus(orderId, newStatus);
      
      if (response.success) {
        // Update the current state
        setOrders(prevOrders => 
          prevOrders.map(order => 
            order.order_id === orderId 
              ? { ...order, order_status: newStatus }
              : order
          )
        );

        // Clear cache because data changed
        clearCache();
      } else {
        throw new Error(response.message || 'Failed to update status');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Failed to update order status: ' + error.message);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (price) => `$${parseFloat(price).toFixed(2)}`;

  const toggleOrderExpansion = (orderId) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  const handleSortChange = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC');
    } else {
      setSortBy(field);
      setSortOrder('DESC');
    }
    setCurrentPage(1);
    clearCache(); // Clear cache when sorting changes
  };

  const handleStatusFilterChange = (value) => {
    setStatusFilter(value);
    setCurrentPage(1);
    clearCache(); // Clear cache when filter changes
  };

  if (loading && orders.length === 0) {
    return (
      <div className="orders-page">
        <div className="loading">Loading orders...</div>
      </div>
    );
  }

  return (
    <div className="orders-page">
      <div className="orders-header">
        <h1>Orders Management</h1>
        <p>Manage and track all customer orders</p>
      </div>

      {/* Search and Filters */}
      <div className="orders-controls">
        <div className="search-div">
          <input
            type="text"
            placeholder="Search by order ID or customer email..."
            defaultValue={searchTerm}
            onChange={(e) => debouncedSearch(e.target.value)}
            className="search-input"
          />
          <img className="icon" src="\src\assets\icon-search.png"/>
        </div>

        <div className="filters">
          <div className="sort-controls">
            <label>Sort by:</label>
            <button
              className={`sort-btn ${sortBy === 'created_at' ? 'active' : ''}`}
              onClick={() => handleSortChange('created_at')}
            >
              Date {sortBy === 'created_at' && (sortOrder === 'ASC' ? '↑' : '↓')}
            </button>
            <button
              className={`sort-btn ${sortBy === 'total_price' ? 'active' : ''}`}
              onClick={() => handleSortChange('total_price')}
            >
              Price {sortBy === 'total_price' && (sortOrder === 'ASC' ? '↑' : '↓')}
            </button>

            <select
              value={statusFilter}
              onChange={(e) => handleStatusFilterChange(e.target.value)}
              className="status-filter"
            >
              <option value="">All Statuses</option>
              <option value="paid">paid</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="results-summary">
        <span>Found {totalCount} orders</span>
      </div>

      {error && <div className="error-message">{error}</div>}

      {orders.length === 0 ? (
        <div className="no-orders">
          <p>No orders found</p>
        </div>
      ) : (
        <>
          <div className="orders-list">
            {orders.map((order) => (
              <div key={order.order_id} className="order-card">
                <div 
                  className="order-summary-admin"
                  onClick={() => toggleOrderExpansion(order.order_id)}
                >
                  <div className="order-basic-info">
                    <div className="order-id">#{order.order_id}</div>
                    <div className="customer-info">
                      <span className="customer-name">
                        {order.first_name} {order.last_name}
                      </span>
                      <span className="customer-email">{order.email}</span>
                    </div>
                  </div>
                  
                  <div className="order-meta">
                    <div className="order-date">
                      {formatDate(order.created_at)}
                    </div>
                    <div className="order-total">
                      {formatPrice(order.total_price)}
                    </div>
                    <StatusDropdown
                      currentStatus={order.order_status}
                      orderId={order.order_id}
                      onStatusChange={handleStatusChange}
                    />
                  </div>
                  
                  <div className="expand-icon">
                    {expandedOrderId === order.order_id ? '▼' : '▶'}
                  </div>
                </div>

                {expandedOrderId === order.order_id && (
                  <div className="order-details">
                    <div className="books-list">
                      <h3>Ordered Books:</h3>
                      {order.books.length === 0 ? (
                      <div> Books on this order are no longer available.</div>
                      )
                      :
                      order.books.map((book, index) => (
                        <div key={`${book.book_id}-${index}`} className="order-book-item">
                          <div className="book-img">
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
                          
                          <div className="admin-order-book-details">
                            <h4>{book.title}</h4>
                            <p className="book-author">By: {book.author}</p>
                            {book.category_name && (
                              <p className="book-category">Category: {book.category_name}</p>
                            )}
                          </div>
                          
                          <div className="book-order-info">
                            <div className="quantity">Qty: {book.quantity}</div>
                            <div className="unit-price">{formatPrice(book.unit_price)} each</div>
                          </div>
                        </div>
                      ))
                    }
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="pagination-btn"
              >
                Previous
              </button>
              
              <div className="pagination-info">
                Page {currentPage} of {totalPages}
              </div>
              
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="pagination-btn"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default OrdersPage;