import { useEffect, useState, useRef } from 'react';
import { useParams, Link, useLocation, useNavigate } from 'react-router-dom';
import { getAllBooksByCategoryId, getCategoryById } from '../../../services/api';
import './CategoryBooksPage.css';

// Caches
const categoryBooksCache = new Map();

function CategoryBooksPage() {
  const { categoryId } = useParams();
  const location = useLocation();
  const [books, setBooks] = useState([]);
  const [categoryName, setCategoryName] = useState(location.state?.categoryName || ''); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortOption, setSortOption] = useState('');
  const hasFetched = useRef(false);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchCategoryName() {
      if (categoryName) return;

      try {
        const res = await getCategoryById(categoryId);
        if (res.success && res.data) {
          setCategoryName(res.data.name);
        }
      } catch (err) {
        console.error('Error fetching category name:', err);
      }
    }
    fetchCategoryName();
  }, [categoryId, categoryName]);

  useEffect(() => {
      async function fetchBooks() {
        try {
          setLoading(true);

          const cameFromBookDetails = sessionStorage.getItem("fromBookDetails") === "true";
          sessionStorage.removeItem("fromBookDetails");

          if (cameFromBookDetails) {
            if (categoryBooksCache.has(categoryId)) {
              setBooks(categoryBooksCache.get(categoryId));
              setLoading(false);
              return;
            }
          }
          categoryBooksCache.clear;
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
    return <p className="no-books-message">No books available in this category...</p>;
  }

  return (
    <div className="books-page">
      <h2>{categoryName || "Category's Books"}</h2> {/* ✅ שם הקטגוריה מגיע גם מרענון */}
      <button className='back-btn' onClick={() => navigate(-1)}>
        <img src="\src\assets\icon-back.png" alt="Back"/>
      </button>
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
            to={
              book.stock_quantity === 0
                ? "#"
                : `/home/categories/${categoryId}/books/${book.id}`
            }
            state={{ book }}
            className="book-card"
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
            <div
              className={`book-content ${
                book.stock_quantity === 0 ? "disabled" : ""
              }`}
            >
              <img
                src={book.image_url}
                alt={book.title}
                className="book-cover"
              />
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
