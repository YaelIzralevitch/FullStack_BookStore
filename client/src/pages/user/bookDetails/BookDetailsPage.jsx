import { useEffect, useState, useContext, useRef } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import CartContext from '../../../contexts/CartContext';
import { getBookById } from '../../../services/api';
import './BookDetailsPage.css';

function BookDetailsPage() {
  const { bookId } = useParams();
  const location = useLocation();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useContext(CartContext);

  const hasFetched = useRef(false);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchBook() {
      try {
        setLoading(true);

        const bookFromState = location.state?.book;

        if (bookFromState && bookFromState.id === parseInt(bookId)) {
          setBook(bookFromState);
          setLoading(false);
          return;
        }

        const response = await getBookById(bookId);
        setBook(response.data);

      } catch (err) {
        setError('Error loading book details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    if (!hasFetched.current) {
      hasFetched.current = true;
      window.scrollTo({ top: 0 });
      fetchBook();
    }
  }, [bookId, location.state]);

  const handleIncrease = () => {
    if (book && quantity < book.stock_quantity) {
      setQuantity(prev => prev + 1);
    } else if (book) {
      setMessage(`Cannot add more than ${book.stock_quantity} copies of "${book.title}".`);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleDecrease = () => {
    setQuantity(prev => (prev > 1 ? prev - 1 : 1));
  };

  const handleAddToCart = () => {
    if (!book) return;

    if (quantity > book.stock_quantity) {
      setMessage(`Only ${book.stock_quantity} copies available in stock.`);
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    addToCart(
      { ...book, price: parseFloat(book.price) },
      quantity
    );
    setMessage(`Added ${quantity} "${book.title}" to cart!`);
    setTimeout(() => setMessage(''), 3000);
    window.scrollTo({ top: 0 });
  };

  const handleGoBack = () => {
    sessionStorage.setItem("fromBookDetails", "true");
    navigate(-1);
 };

  if (loading) return <p>Loading book details...</p>;
  if (error) return <p>{error}</p>;
  if (!book) return <p>Book not found</p>;

  return (
    <div className="book-details">
      <button className='back-btn' onClick={handleGoBack}>
        <img src="\src\assets\icon-back.png" alt="Back"/>
      </button>
      {message && <div className="success-message">{message}</div>}
      <img src={book.image_url} alt={book.title} className="book-details-image" />
      <div className="book-details-info">
        <h2>{book.title}</h2>
        <p><strong>Author:</strong> {book.author}</p>
        <p><strong>Price:</strong> ${book.price}</p>
        <p className='book-description'>{book.description}</p>

        {book.stock_quantity === 0 && (
          <p className="out-of-stock-msg">This book is out of stock!</p>
        )}
        {book.stock_quantity > 0 && book.stock_quantity <= 5 && (
          <p className="low-stock-msg">Only {book.stock_quantity} left in stock!</p>
        )}

        {book.stock_quantity > 0 && (
          <>
            <div className="quantity-control">
              <button onClick={handleDecrease} disabled={quantity <= 1}>−</button>
              <span>{quantity}</span>
              <button 
                onClick={handleIncrease} 
                disabled={quantity >= book.stock_quantity}
              >
                +
              </button>
            </div>

            <button className="add-to-cart-btn" onClick={handleAddToCart}>
              Add to Cart
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default BookDetailsPage;
