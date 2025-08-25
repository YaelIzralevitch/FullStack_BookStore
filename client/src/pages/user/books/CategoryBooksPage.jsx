import { useEffect, useState, useRef } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { getAllBooksByCategoryId } from '../../../services/api';
import './CategoryBooksPage.css';

// Cache
const categoryBooksCache = new Map();
let lastVisitedPath = null;

function CategoryBooksPage() {
  const { categoryId } = useParams();
  const location = useLocation();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortOption, setSortOption] = useState('');

  const hasFetched = useRef(false);

  useEffect(() => {
    // Check if they are coming from a page not related to this category
    const currentPath = location.pathname;
    const isComingFromDifferentSection = lastVisitedPath && 
      !lastVisitedPath.includes(`/categories/${categoryId}`) &&
      !currentPath.includes(lastVisitedPath);
    
    // If coming from a different region - clear the cache
    if (isComingFromDifferentSection) {
      categoryBooksCache.clear();
    }
    
    lastVisitedPath = currentPath;

    async function fetchBooks() {
      try {
        setLoading(true);
        
        // Checking if there is something in the cache
        if (categoryBooksCache.has(categoryId)) {
          const cachedData = categoryBooksCache.get(categoryId);
          setBooks(cachedData);
          setLoading(false);
          return;
        }

        // If not in cache - fetch from server
        const response = await getAllBooksByCategoryId(categoryId);
        const booksData = response.data || [];
        
        categoryBooksCache.set(categoryId, booksData);
        setBooks(booksData);
      } catch (err) {
        setError('Error loading books');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    if (!hasFetched.current) {
      hasFetched.current = true;
      window.scrollTo({ top: 0 });
      fetchBooks();
    }
  }, [categoryId, location.pathname]);

  const handleSortChange = (e) => {
    const option = e.target.value;
    setSortOption(option);

    let sortedBooks = [...books];
    if (option === 'az') {
      sortedBooks.sort((a, b) => a.title.localeCompare(b.title));
    } else if (option === 'za') {
      sortedBooks.sort((a, b) => b.title.localeCompare(a.title));
    } else if (option === 'priceLowHigh') {
      sortedBooks.sort((a, b) => a.price - b.price);
    } else if (option === 'priceHighLow') {
      sortedBooks.sort((a, b) => b.price - a.price);
    }

    setBooks(sortedBooks);
  };

  if (loading) return <p>Loading books...</p>;
  if (error) return <p>{error}</p>;
  if (!loading && books.length === 0) {
    return <p className="no-books-message">
      No books available in this category...
    </p>;
  }

  return (
    <div className="books-page">
      <h2>Category's Books</h2>
      
      <div className="sort-container">
        <label>Sort by: </label>
        <select value={sortOption} onChange={handleSortChange}>
          <option value="">Select</option>
          <option value="az">Title: A → Z</option>
          <option value="za">Title: Z → A</option>
          <option value="priceLowHigh">Price: Low → High</option>
          <option value="priceHighLow">Price: High → Low</option>
        </select>
      </div>

      <div className="books-grid">
        {books.map((book) => (
          <Link
            key={book.id}
            to={book.stock_quantity === 0 ? "#" : `/home/categories/${categoryId}/books/${book.id}`}
            className='book-card'
            onClick={(e) => {
              if (book.stock_quantity === 0) e.preventDefault();
            }}
          >
            {book.stock_quantity === 0 && (
              <div className="out-of-stock">Out Of Stock!</div>
            )}
            {book.stock_quantity <= 5 && book.stock_quantity > 0 && (
              <div className="low-stock">Only {book.stock_quantity} left!</div>
            )}
            <div className={`book-content ${book.stock_quantity === 0 ? "disabled" : ""}`}>
              <img src={book.image_url} alt={book.title} className="book-cover" />
              <h3 className="book-title">{book.title}</h3>
              <p className="book-price">${book.price}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default CategoryBooksPage;