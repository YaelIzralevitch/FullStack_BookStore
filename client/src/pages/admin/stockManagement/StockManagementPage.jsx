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
  const [booksByCategory, setBooksByCategory] = useState({});
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedBook, setSelectedBook] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showBookModal, setShowBookModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState(''); 
  const [sortOrder, setSortOrder] = useState('ASC'); 

  const hasFetched = useRef(false);

  // --- טעינת קטגוריות וספרים
  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    async function fetchData() {
      try {
        setLoading(true);
        const cats = await getCategories();
        const categoriesData = cats.data || [];
        setCategories(categoriesData);

        if (categoriesData.length > 0) {
          setSelectedCategoryId(categoriesData[0].id);
          setSelectedCategory(categoriesData[0]);
        }

        const booksPromises = categoriesData.map(cat => getBooksByCategoryId(cat.id));
        const booksResults = await Promise.all(booksPromises);

        const booksObj = {};
        categoriesData.forEach((cat, idx) => {
          booksObj[cat.id] = booksResults[idx].data || [];
        });

        setBooksByCategory(booksObj);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

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
    const oldCategoryId = selectedBook?.category_id;

    if (bookData.id) {
      await updateBookInInventory(bookData.id, bookData);
    } else {
      const newBook = await createBookInInventory(bookData);
      bookData.id = newBook.id;
    }

    // אם הקטגוריה השתנתה – להסיר מהישנה ולהוסיף לחדשה
    if (oldCategoryId && oldCategoryId !== bookData.category_id) {
      setBooksByCategory(prev => {
        const updated = { ...prev };
        updated[oldCategoryId] = updated[oldCategoryId].filter(b => b.id !== bookData.id);
        updated[bookData.category_id] = [...(updated[bookData.category_id] || []), bookData];
        return updated;
      });
      setSelectedCategoryId(bookData.category_id);
      const newCat = categories.find(c => c.id === bookData.category_id);
      setSelectedCategory(newCat);
    } else {
      const books = await getBooksByCategoryId(bookData.category_id);
      setBooksByCategory(prev => ({ ...prev, [bookData.category_id]: books.data || [] }));
    }

    setShowBookModal(false);
  };

  const handleDeleteBook = async (book) => {
    if (!window.confirm(`Are you sure you want to delete "${book.title}"?`)) return;

    try {
      if (selectedBook?.id === book.id) {
        setShowBookModal(false);
        setSelectedBook(null);
      }
      await deleteBookInInventory(book.id);
      setBooksByCategory(prev => ({
        ...prev,
        [book.category_id]: prev[book.category_id].filter(b => b.id !== book.id)
      }));
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

      // עדכון categories ו-booksByCategory יחד
      setCategories(prevCats => {
        const updatedCats = [...prevCats, categoryData];
        setBooksByCategory(prevBooks => ({ ...prevBooks, [categoryData.id]: [] }));

        setSelectedCategoryId(categoryData.id);
        setSelectedCategory(categoryData);

        return updatedCats;
      });
    }

    setShowCategoryModal(false);
  };

  const handleDeleteCategory = async (categoryId) => {
    if (!window.confirm("Are you sure you want to delete this category?")) return;

    try {
      await deleteInventoryCategory(categoryId);
      setCategories(prev => prev.filter(c => c.id !== categoryId));
      setBooksByCategory(prev => {
        const updated = { ...prev };
        delete updated[categoryId];
        return updated;
      });
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

  // --- ספרים מסוננים וממוינים
  const booksInCategory = booksByCategory[selectedCategoryId] || [];
  const filteredBooks = booksInCategory.filter(book =>
    book.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedBooks = sortBy
    ? [...filteredBooks].sort((a, b) => {
        if (sortBy === 'title') return sortOrder === 'ASC' ? a.title.localeCompare(b.title) : b.title.localeCompare(a.title);
        if (sortBy === 'price') return sortOrder === 'ASC' ? a.price - b.price : b.price - a.price;
        return 0;
      })
    : filteredBooks;

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

            {booksInCategory.length === 0 ? (
              <div className="no-books">
                <p>There are no books to display in this category...</p>
                <button 
                  className="delete-category-btn" 
                  onClick={() => handleDeleteCategory(selectedCategoryId)}
                >
                  Delete category 🗑️
                </button>
              </div>
            ) : sortedBooks.length === 0 ? (
              <div className="no-books">
                <p>No matching results for your search...</p>
              </div>
            ) : (
              <div className="books-list">
                {sortedBooks.map(book => (
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
          category={selectedCategory} 
          onClose={() => setShowCategoryModal(false)} 
          onSave={handleCategorySave} 
        />
      )}
    </div>
  );
}

export default StockManagementPage;
