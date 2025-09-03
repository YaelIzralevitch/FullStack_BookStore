import { useEffect, useState, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import debounce from 'lodash.debounce';
import { 
  getCategories, 
  getBooksByCategoryWithPagination,  
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
  const [books, setBooks] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [popupCategory, setPopupCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [booksLoading, setBooksLoading] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [showBookModal, setShowBookModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('title'); 
  const [sortOrder, setSortOrder] = useState('ASC');
  
  // pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const hasFetched = useRef(false);
  const [searchParams, setSearchParams] = useSearchParams();

  // Cache system
  const cache = useRef(new Map());
  const currentCacheKey = useRef(null);

  // Generate cache key based on current filters and category
  const generateCacheKey = () => {
    return `cat-${selectedCategoryId}|${searchTerm}|${sortBy}|${sortOrder}`;
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

  // Update cached data locally
  const updateCachedData = (cacheKey, page, updatedBooks, newTotalCount = null) => {
    if (!cache.current.has(cacheKey)) return;
    
    const cacheGroup = cache.current.get(cacheKey);
    const cachedData = cacheGroup.get(page);
    
    if (cachedData) {
      cacheGroup.set(page, {
        ...cachedData,
        books: updatedBooks,
        totalCount: newTotalCount !== null ? newTotalCount : cachedData.totalCount,
        timestamp: Date.now()
      });
    }
  };

  // Clear cache when component unmounts
  useEffect(() => {
    return () => {
      clearCache();
    };
  }, []);

  // delay search input
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
  }, [currentPage, selectedCategoryId]);

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
          const urlCategoryId = searchParams.get('categoryId');
          const categoryFromUrl = urlCategoryId 
            ? categoriesData.find(cat => cat.id === parseInt(urlCategoryId))
            : null;

          if (categoryFromUrl) {
            setSelectedCategoryId(categoryFromUrl.id);
            setSelectedCategory(categoryFromUrl);
          } else {
            setSelectedCategoryId(categoriesData[0].id);
            setSelectedCategory(categoriesData[0]);
            setSearchParams({ categoryId: categoriesData[0].id.toString() });
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchCategories();
  }, []);

  useEffect(() => {
    if (selectedCategoryId) {
      const newCacheKey = generateCacheKey();
      
      // If cache key changed (filters/sorting/category changed), clear cache
      if (currentCacheKey.current && currentCacheKey.current !== newCacheKey) {
        clearCache();
      }
      
      currentCacheKey.current = newCacheKey;
      fetchBooks();
    }
  }, [selectedCategoryId, currentPage, searchTerm, sortBy, sortOrder]);

  const fetchBooks = async () => {
    if (!selectedCategoryId) return;

    const cacheKey = generateCacheKey();
    const cachedData = getCachedData(cacheKey, currentPage);
    
    // Check if we have valid cached data
    if (cachedData) {
      setBooks(cachedData.books);
      setTotalPages(cachedData.totalPages);
      setTotalCount(cachedData.totalCount);
      setBooksLoading(false);
      return;
    }

    try {
      setBooksLoading(true);
      
      const params = {
        search: searchTerm,
        sortBy,
        sortOrder,
        page: currentPage,
        limit: 10
      };

      const response = await getBooksByCategoryWithPagination(selectedCategoryId, params);
      
      if (response.success) {
        const responseData = {
          books: response.data.books,
          totalPages: response.data.totalPages,
          totalCount: response.data.totalCount
        };
        
        // Cache the response
        setCachedData(cacheKey, currentPage, responseData);
        
        setBooks(responseData.books);
        setTotalPages(responseData.totalPages);
        setTotalCount(responseData.totalCount);
      } else {
        console.error('Failed to fetch books:', response.message);
      }
    } catch (err) {
      console.error('Error fetching books:', err);
    } finally {
      setBooksLoading(false);
    }
  };

  // change selected category
  const handleCategoryChange = (category) => {
    setSelectedCategoryId(category.id);
    setSearchParams({ categoryId: category.id.toString() });
    setSelectedCategory(category);
    setCurrentPage(1);
    setSearchTerm('');
    setSortBy('title');
    setSortOrder('ASC');
    clearCache(); // Clear cache when category changes
  };

  // handle add book 
  const handleAddBook = (category) => {
    setSelectedBook({ category_id: category.id }); 
    setShowBookModal(true);
  };

  const handleEditBook = (book) => {
    setSelectedBook(book);
    setShowBookModal(true);
  };

  const handleBookSave = async (bookId, bookData) => {
    try {
      let savedBook;

      if (bookId) {
        await updateBookInInventory(bookId, bookData);

        if (
          bookData.category_id !== undefined &&
          bookData.category_id !== selectedCategoryId
        ) {
          const newCat = categories.find(c => c.id === bookData.category_id);
          if (newCat) {
            setSelectedCategoryId(bookData.category_id);
            setSelectedCategory(newCat);
            setCurrentPage(1);
            setSearchParams({ categoryId: bookData.category_id.toString() });
            clearCache();
          }
        }
        else{
            // Local update of the list
            const updatedBooks = books.map(book =>
              book.id === bookId ? { ...book, ...bookData } : book
            );
            setBooks(updatedBooks);
    
            const cacheKey = generateCacheKey();
            updateCachedData(cacheKey, currentPage, updatedBooks);
    
            savedBook = updatedBooks.find(b => b.id === bookId);
        }
      } else {
        const response = await createBookInInventory(bookData);
        savedBook = response.data;

        if (bookData.category_id === selectedCategoryId) {
          const updatedBooks = [savedBook, ...books];
          const newTotalCount = totalCount + 1;

          setBooks(updatedBooks);
          setTotalCount(newTotalCount);

          const cacheKey = generateCacheKey();
          updateCachedData(cacheKey, currentPage, updatedBooks, newTotalCount);
        } else {
          // If it belongs to another category – we will move on to it.
          const newCat = categories.find(c => c.id === bookData.category_id);
          if (newCat) {
            setSelectedCategoryId(bookData.category_id);
            setSelectedCategory(newCat);
            setCurrentPage(1);
            setSearchParams({ categoryId: bookData.category_id.toString() });
            clearCache();
          }
        }
      }

      setShowBookModal(false);
    } catch (err) {
      console.error("Error saving book:", err);
      alert("Failed to save book");
    }
  };

  const handleDeleteBook = async (book) => {
    if (!window.confirm(`Are you sure you want to delete "${book.title}"?`)) return;

    try {
      if (selectedBook?.id === book.id) {
        setShowBookModal(false);
        setSelectedBook(null);
      }
      
      await deleteBookInInventory(book.id);
      
      const updatedBooks = books.filter(b => b.id !== book.id);
      const newTotalCount = totalCount - 1;
      
      setBooks(updatedBooks);
      setTotalCount(newTotalCount);
      
      const cacheKey = generateCacheKey();
      updateCachedData(cacheKey, currentPage, updatedBooks, newTotalCount);
      
    } catch (err) {
      console.error('Error deleting book:', err);
      alert('Failed to delete book');
    }
  };

  // handle category operations
  const handleAddCategory = () => {
    setPopupCategory({});
    setShowCategoryModal(true);
  };

  const handleCategorySave = async (categoryData) => {
    try {
      if (categoryData.id) {
        await updateInventoryCategory(categoryData.id, categoryData);
        setCategories(prev => prev.map(c => c.id === categoryData.id ? categoryData : c));
        
        if (selectedCategoryId === categoryData.id) {
          setSelectedCategory(categoryData);
        }
      } else {
        const newCat = await createInventoryCategory(categoryData);
        categoryData.id = newCat.data.id;

        setCategories(prevCats => [...prevCats, categoryData]);
        setSelectedCategoryId(categoryData.id);
        setSelectedCategory(categoryData);
        setCurrentPage(1);
        
        // Clear cache when new category is created and selected
        clearCache();
      }

      setShowCategoryModal(false);
    } catch (err) {
      console.error('Error saving category:', err);
      alert('Failed to save category');
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (!window.confirm("Are you sure you want to delete this category?")) return;

    try {
      await deleteInventoryCategory(categoryId);
      setCategories(prev => prev.filter(c => c.id !== categoryId));
      
      // Clear cache when category is deleted
      clearCache();
      
      if (selectedCategoryId === categoryId) {
        const remainingCategories = categories.filter(c => c.id !== categoryId);
        if (remainingCategories.length > 0) {
          setSelectedCategoryId(remainingCategories[0].id);
          setSelectedCategory(remainingCategories[0]);
        } else {
          setSelectedCategoryId(null);
          setSelectedCategory(null);
        }
      }
    } catch (err) {
      console.error("Error deleting category:", err);
      alert("Failed to delete category");
    }
  };

  const handleSortChange = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC');
    } else {
      setSortBy(field);
      setSortOrder('ASC');
    }
    setCurrentPage(1);
    clearCache(); // Clear cache when sorting changes
  };

  if (loading) return <p>Loading inventory management...</p>;

  return (
    <div className="inventory-page">
      <h2>Inventory Management</h2>

      <div className="category-buttons">
        {categories.map(category => (
          <button 
            key={category.id} 
            className={`category-btn ${selectedCategoryId === category.id ? 'active' : ''}`}
            onClick={() => handleCategoryChange(category)}
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
                placeholder="Search books by name or author..." 
                defaultValue={searchTerm}
                onChange={(e) => debouncedSearch(e.target.value)}
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
                  Title {sortBy === 'title' && (sortOrder === 'ASC' ? '↑' : '↓')}
                </button>
                <button
                  className={`sort-btn ${sortBy === 'price' ? 'active' : ''}`}
                  onClick={() => handleSortChange('price')}
                >
                  Price {sortBy === 'price' && (sortOrder === 'ASC' ? '↑' : '↓')}
                </button>
                <button
                  className={`sort-btn ${sortBy === 'stock_quantity' ? 'active' : ''}`}
                  onClick={() => handleSortChange('stock_quantity')}
                >
                  Stock {sortBy === 'stock_quantity' && (sortOrder === 'ASC' ? '↑' : '↓')}
                </button>
              </div>
            </div>
          </div>
        )}

        {selectedCategoryId && selectedCategory && (
          <div className="selected-category-header">
            <div className='stoke-cat-img-preview-wrapper'>
              <img className="image-preview" src={selectedCategory.image_url || "https://i.pinimg.com/1200x/67/41/01/674101e0187b34ce24feda85191c2ac9.jpg"}  alt="search"/>
            </div>
            <h3 className="category-title">{selectedCategory.name}</h3>
            <button 
              className="edit-category-btn" 
              onClick={() => {
                setPopupCategory(selectedCategory);
                setShowCategoryModal(true);
              }}
              title="Edit category"
            >
              ✏️
            </button>
          </div>
        )}

        {selectedCategoryId && (
          <div className="books-section">
            <div className="books-section-header">
              <button className="add-book-btn" onClick={() => handleAddBook({ id: selectedCategoryId })}>
                + Add Book
              </button>
              
              {totalCount > 0 && (
                <div className="results-summary">
                  <span>Found {totalCount} books</span>
                </div>
              )}
            </div>

            {booksLoading && books.length === 0 ? (
              <div className="loading">Loading books...</div>
            ) : totalCount === 0 && searchTerm === '' ? (
              <div className="no-books">
                <p>There are no books to display in this category...</p>
                <button 
                  className="delete-category-btn" 
                  onClick={() => handleDeleteCategory(selectedCategoryId)}
                >
                  Delete category 🗑
                </button>
              </div>
            ) : books.length === 0 ? (
              <div className="no-books">
                <p>No matching results for your search...</p>
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
                        🗑
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
      </div>

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
          category={popupCategory}
          onClose={() => setShowCategoryModal(false)} 
          onSave={handleCategorySave} 
        />
      )}
    </div>
  );
}

export default StockManagementPage;