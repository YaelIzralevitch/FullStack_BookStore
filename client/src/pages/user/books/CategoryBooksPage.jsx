import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getBooksByCategoryId } from '../../../services/api';
import './CategoryBooksPage.css';

function CategoryBooksPage() {
  const { categoryId } = useParams();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortOption, setSortOption] = useState('');

  useEffect(() => {
    async function fetchBooks() {
      try {
        setLoading(true);
        const response = await getBooksByCategoryId(categoryId);
        setBooks(response.data || []);
      } catch (err) {
        setError('Error loading books');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchBooks();
  }, [categoryId]);

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
            to={`/home/categories/${categoryId}/books/${book.id}`}
            className="book-card"
          >
            {book.stock_quantity <= 5 && (
              <div className="low-stock">
                Only {book.stock_quantity} left!
              </div>
            )}
            <img src={book.image_url} alt={book.title} className="book-image" />
            <h3 className="book-title">{book.title}</h3>
            <p className="book-price">${book.price}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default CategoryBooksPage;
