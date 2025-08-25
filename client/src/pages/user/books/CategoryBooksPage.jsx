import { useEffect, useState, useRef } from 'react';
import { useParams, Link, useLocation, useNavigate } from 'react-router-dom';
import { getBooksByCategoryId, getCategoryById } from '../../../services/api';
import './CategoryBooksPage.css';

function CategoryBooksPage() {
  const { categoryId } = useParams();
  const location = useLocation();
  const [books, setBooks] = useState([]);
  const [categoryName, setCategoryName] = useState(location.state?.categoryName || ''); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortOption, setSortOption] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const hasFetched = useRef(false);
  const navigate = useNavigate();

  // Session storage key for this category
  const sessionKey = `categoryBooks_${categoryId}`;

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
    if (!hasFetched.current) {
      hasFetched.current = true;
      
      // Load from session storage if available
      const savedData = sessionStorage.getItem(sessionKey);
      if (savedData) {
        try {
          const parsed = JSON.parse(savedData);
          setBooks(parsed.books || []);
          setCurrentPage(parsed.currentPage || 1);
          setTotalPages(parsed.totalPages || 1);
          setTotalCount(parsed.totalCount || 0);
          setSortOption(parsed.sortOption || '');
          setLoading(false);
          return;
        } catch (err) {
          console.error('Error parsing saved data:', err);
        }
      }
      
      fetchBooks();
    }
  }, []);

  useEffect(() => {
    if (totalCount) {
      fetchBooks();
    }
  }, [categoryId, location.pathname, currentPage, sortOption]);

  useEffect(() => {
    window.scrollTo({
      top: 0,
    });
  }, [currentPage]);

  // Save current state to session storage
  const saveToSession = (booksData, page, totalPgs, totalCnt, sort) => {
    const dataToSave = {
      books: booksData,
      currentPage: page,
      totalPages: totalPgs,
      totalCount: totalCnt,
      sortOption: sort,
    };
    sessionStorage.setItem(sessionKey, JSON.stringify(dataToSave));
  };

  async function fetchBooks() {
    try {
      setLoading(true);

      // Check if coming back from book details
      const cameFromBookDetails = sessionStorage.getItem("fromBookDetails") === "true";
      const fromBookDetailsCategory = sessionStorage.getItem("fromBookDetailsCategory");
      
      sessionStorage.removeItem("fromBookDetails");
      sessionStorage.removeItem("fromBookDetailsCategory");

      // If coming back from same category book details, use saved data
      if (cameFromBookDetails && fromBookDetailsCategory === categoryId) {
        const savedData = sessionStorage.getItem(sessionKey);
        if (savedData) {
          try {
            const parsed = JSON.parse(savedData);
            setBooks(parsed.books || []);
            setCurrentPage(parsed.currentPage || 1);
            setTotalPages(parsed.totalPages || 1);
            setTotalCount(parsed.totalCount || 0);
            setSortOption(parsed.sortOption || '');
            setLoading(false);
            return;
          } catch (err) {
            console.error('Error parsing saved data:', err);
          }
        }
      }
      
      // Fetch from server with pagination
      const params = {
        page: currentPage,
        limit: 10,
        sortBy: getSortByField(),
        sortOrder: getSortOrder()
      };

      const response = await getBooksByCategoryId(categoryId, params);
      console.log("response", response)
      
      if (response.success) {
        const booksData = response.data.books || [];
        const totalPgs = response.data.totalPages || 1;
        const totalCnt = response.data.totalCount || 0;
        
        setBooks(booksData);
        setTotalPages(totalPgs);
        setTotalCount(totalCnt);
        
        // Save to session storage
        saveToSession(booksData, currentPage, totalPgs, totalCnt, sortOption);
      } else {
        setError(response.message || 'Error loading books');
      }
    } catch (err) {
      setError('Error loading books');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const getSortByField = () => {
    switch(sortOption) {
      case 'az':
      case 'za':
        return 'title';
      case 'priceLowHigh':
      case 'priceHighLow':
        return 'price';
      default:
        return '';
    }
  };

  const getSortOrder = () => {
    switch(sortOption) {
      case 'az':
      case 'priceLowHigh':
        return 'ASC';
      case 'za':
      case 'priceHighLow':
        return 'DESC';
      default:
        return 'DESC';
    }
  };

  const handleSortChange = (e) => {
    const option = e.target.value;
    setSortOption(option);
    setCurrentPage(1);
    sessionStorage.removeItem(sessionKey);
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  // Clear session storage when navigating away
  useEffect(() => {
    return () => {
      // Clean up - remove session data when component unmounts
      // unless we're going to a book details page
      const currentPath = window.location.pathname;
      if (!currentPath.includes(`/categories/${categoryId}/books/`)) {
        sessionStorage.removeItem(sessionKey);
      }
    };
  }, [sessionKey, categoryId]);

  if (loading && books.length === 0) {
    return (
      <div className="books-page">
        <div className="loading">Loading books...</div>
      </div>
    );
  }

  if (error) return <p>{error}</p>;
  
  if (!loading && books.length === 0) {
    return <p className="no-books-message">No books available in this category...</p>;
  }

  return (
    <div className="books-page">
      <h2>{categoryName || "Category's Books"}</h2>
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

      {/* Results Summary */}
      <div className="results-summary">
        <span>Found {totalCount} books</span>
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
                src={book.image_url || "https://i.pinimg.com/736x/b8/a1/e0/b8a1e02c6fda8e39200d7b6fb6fb36b0.jpg"}
                alt={book.title}
                className="book-cover"
              />
              <h3 className="book-title">{book.title}</h3>
              <p className="book-price">${book.price}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="pagination-btn"
          >
            Previous
          </button>
          
          <div className="pagination-info">
            Page {currentPage} of {totalPages}
          </div>
          
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="pagination-btn"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

export default CategoryBooksPage;