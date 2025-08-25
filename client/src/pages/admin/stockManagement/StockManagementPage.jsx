import { useEffect, useState, useRef } from 'react';
import { 
  getCategories, 
  getBooksByCategoryId, 
  createBookInInventory, 
  updateBookInInventory, 
  createInventoryCategory, 
  updateInventoryCategory, 
  deleteBookInInventory, 
  deleteInventoryCategory
} from '../../../services/api';
import BookPopup from '../../../components/Book/BookPopup';
import CategoryPopup from '../../../components/Category/CategoryPopup';
import './StockManagementPage.css';

function StockManagementPage() {
  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const [books, setBooks] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [loading, setLoading] = useState(true);
  const [selectedBook, setSelectedBook] = useState(null);
  const [showBookModal, setShowBookModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState(''); 
  const [sortOrder, setSortOrder] = useState('ASC'); 

  const BOOKS_LIMIT = 10;
  const hasFetched = useRef(false);

  // --- טעינת קטגוריות
  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    async function fetchCategories() {
      try {
        setLoading(true);
        const cats = await getCategories();
        const categoriesData = cats.data || [];
        setCategories(categoriesData);

        if (categoriesData.length > 0) {
          setSelectedCategoryId(categoriesData[0].id);
          setSelectedCategory(categoriesData[0]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchCategories();
  }, []);

  // --- טעינת ספרים לקטגוריה
  useEffect(() => {
    if (!selectedCategoryId) return;

    async function fetchBooks() {
      try {
        setLoading(true);
        const params = {
          page: currentPage,
          limit: BOOKS_LIMIT,
          search: searchTerm,
          sortBy,
          sortOrder
        };
        const res = await getBooksByCategoryId(selectedCategoryId, params);

        if (res.success) {
          setBooks(res.data.books || []);
          setTotalPages(res.data.totalPages || 1);
          setTotalCount(res.data.totalCount || 0);
        } else {
          setBooks([]);
          setTotalPages(1);
          setTotalCount(0);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchBooks();
  }, [selectedCategoryId, currentPage, searchTerm, sortBy, sortOrder]);

  // --- ניהול ספרים
  const handleAddBook = (category) => {
    setSelectedBook({ category_id: category.id }); 
    setShowBookModal(true);
  };

  const handleEditBook = (book) => {
    setSelectedBook(book);
    setShowBookModal(true);
  };

  const handleBookSave = async (bookData) => {
    if (bookData.id) {
      await updateBookInInventory(bookData.id, bookData);
    } else {
      const newBook = await createBookInInventory(bookData);
      bookData.id = newBook.id;
    }

    // טען מחדש את הספרים מהשרת
    setCurrentPage(1);
    await fetchBooksForCategory(selectedCategoryId, 1);

    setShowBookModal(false);
  };

  const fetchBooksForCategory = async (categoryId, page) => {
    try {
      const params = {
        page,
        limit: BOOKS_LIMIT,
        search: searchTerm,
        sortBy,
        sortOrder
      };
      const res = await getBooksByCategoryId(categoryId, params);
      if (res.success) {
        setBooks(res.data.books || []);
        setTotalPages(res.data.totalPages || 1);
        setTotalCount(res.data.totalCount || 0);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteBook = async (book) => {
    if (!window.confirm(`Are you sure you want to delete "${book.title}"?`)) return;

    try {
      await deleteBookInInventory(book.id);
      setBooks(prev => prev.filter(b => b.id !== book.id));
    } catch (err) {
      console.error('Error deleting book:', err);
      alert('Failed to delete book');
    }
  };

  // --- ניהול קטגוריות
  const handleAddCategory = () => {
    setSelectedCategory({});
    setShowCategoryModal(true);
  };

  const handleCategorySave = async (categoryData) => {
    if (categoryData.id) {
      await updateInventoryCategory(categoryData.id, categoryData);
      setCategories(prev => prev.map(c => c.id === categoryData.id ? categoryData : c));
    } else {
      const newCat = await createInventoryCategory(categoryData);
      categoryData.id = newCat.data.id;

      setCategories(prev => [...prev, categoryData]);
      setSelectedCategoryId(categoryData.id);
      setSelectedCategory(categoryData);
    }

    setShowCategoryModal(false);
  };

  const handleDeleteCategory = async (categoryId) => {
    if (!window.confirm("Are you sure you want to delete this category?")) return;

    try {
      await deleteInventoryCategory(categoryId);
      setCategories(prev => prev.filter(c => c.id !== categoryId));

      if (selectedCategoryId === categoryId) {
        setSelectedCategoryId(categories[0]?.id || null);
        setSelectedCategory(categories[0] || null);
      }
    } catch (err) {
      console.error("Error deleting category:", err);
      alert("Failed to delete category");
    }
  };

  if (loading) return <p>Loading inventory management...</p>;

  const handleSortChange = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC');
    } else {
      setSortBy(field);
      setSortOrder('ASC');
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSortBy('');
    setSortOrder('ASC');
  };

  return (
    <div className="inventory-page">
      <h2>Inventory Management</h2>

      <div className="category-buttons">
        {categories.map(category => (
          <button 
            key={category.id} 
            className={`category-btn ${selectedCategoryId === category.id ? 'active' : ''}`}
            onClick={() => {
              setSelectedCategoryId(category.id);
              setSelectedCategory(category);
              setCurrentPage(1);
            }}
          >
            {category.name}
          </button>
        ))}
        <button className="add-category-btn" onClick={handleAddCategory}>+ Add Category</button>
      </div>
      <div className='controls-books-section'>
        {selectedCategoryId && (
          <div className="inventory-controls">
            <div className="search-div">
              <input 
                type="text" 
                placeholder="Search books by name..." 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
                className="search-input"
              />
              <img className="icon" src="\src\assets\icon-search.png" alt="search"/>
            </div>

            <div className="filters">
              <div className="sort-controls">
                <label>Sort by:</label>
                <button
                  className={`sort-btn ${sortBy === 'title' ? 'active' : ''}`}
                  onClick={() => handleSortChange('title')}
                >
                  Name {sortBy === 'title' && (sortOrder === 'ASC' ? '↑' : '↓')}
                </button>
                <button
                  className={`sort-btn ${sortBy === 'price' ? 'active' : ''}`}
                  onClick={() => handleSortChange('price')}
                >
                  Price {sortBy === 'price' && (sortOrder === 'ASC' ? '↑' : '↓')}
                </button>
              </div>

              {(searchTerm || sortBy) && (
                <button 
                  onClick={clearFilters}
                  className="clear-filters-btn"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>
        )}

        {selectedCategoryId && (
          <div className="books-section">
            <button className="add-book-btn" onClick={() => handleAddBook({ id: selectedCategoryId })}>
              + Add Book
            </button>

          {books.length === 0 ? (
            <div className="no-books">
              <p>No books found in this category...</p>
              <button 
                className="delete-category-btn" 
                onClick={() => handleDeleteCategory(selectedCategoryId)}
              >
                Delete category 🗑️
              </button>
            </div>
          ) : (
            <>
              <div className="books-list">
                {books.map(book => (
                  <div key={book.id} className="book-row" onClick={() => handleEditBook(book)}>
                    <div className="book-image">
                      {book.image_url ? (
                        <img src={book.image_url} alt={book.title} />
                      ) : (
                        <div className="image-placeholder">📖</div>
                      )}
                    </div>
                    <div className="book-info">
                      <p className="book-title">{book.title}</p>
                      <p className="book-author">By: {book.author}</p>
                    </div>
                    <div className="book-meta">
                      <p>Price per unit: ${book.price}</p>
                      <p>In stock: {book.stock_quantity}</p>
                    </div>
                    <button 
                      className="delete-book-btn" 
                      onClick={(e) => { e.stopPropagation(); handleDeleteBook(book); }}
                    >
                      🗑️
                    </button>
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
      )}

      {showBookModal && (
        <BookPopup 
          book={selectedBook} 
          onClose={() => setShowBookModal(false)} 
          onSave={handleBookSave}
          categories={categories} 
        />
      )}

      {showCategoryModal && (
        <CategoryPopup 
          category={selectedCategory} 
          onClose={() => setShowCategoryModal(false)} 
          onSave={handleCategorySave} 
        />
      )}
    </div>
  );
}

export default StockManagementPage;
