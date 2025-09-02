import { useState, useEffect } from 'react';
import '../Category/CategoryPopup.css';
import './BookPopup.css';

function BookPopup({ book, onClose, onSave, categories }) {
  const [formData, setFormData] = useState({
    id: null,
    category_id: '',
    title: '',
    author: '',
    description: '',
    price: '',
    stock_quantity: '',
    image_url: ''
  });
  const [originalBook, setOriginalBook] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (book) {
      setFormData(book);
      setOriginalBook(book);
    }
  }, [book]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.category_id || formData.category_id === '') {
      newErrors.category_id = 'Category is required';
    }
    if (!formData.title?.trim()) newErrors.title = 'Title is required';
    if (!formData.author?.trim()) newErrors.author = 'Author is required';
    if (!formData.description?.trim()) newErrors.description = 'Description is required';
    if (formData.price === '' || isNaN(formData.price) || Number(formData.price) < 0) {
      newErrors.price = 'Incorrect price';
    }
    if (formData.stock_quantity === '' || isNaN(formData.stock_quantity) || Number(formData.stock_quantity) < 0) {
      newErrors.stock_quantity = 'Incorrect stock quantity';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const getChangedBookFields = () => {
    const changes = {};
    if (!originalBook) return formData;

    Object.keys(formData).forEach((key) => {
      const originalValue = originalBook[key] ?? '';
      const editedValue = formData[key] ?? '';
      if (originalValue !== editedValue) {
        changes[key] = editedValue;
      }
    });

    return changes;
  };
  
  const handleSubmit = () => {
    if (!validate()) return;

    const changedFields = getChangedBookFields();

    if (Object.keys(changedFields).length === 0) {
      onClose();
      return;
    }

    onSave(
      formData.id,
      {
      ...changedFields,
      ...(changedFields.category_id !== undefined && { category_id: Number(formData.category_id) }),
      ...(changedFields.price !== undefined && { price: parseFloat(formData.price) }),
      ...(changedFields.stock_quantity !== undefined && { stock_quantity: parseInt(formData.stock_quantity) })
      }
    );
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content two-columns">
        <h3>{formData.id ? 'Edit Book' : 'Add Book'}</h3>

        <div className="book-layout">
          <div className="book-image-section">
              <div className="image-preview-container">
                <div className="image-preview-wrapper">
                  {formData.image_url ? (
                    <img 
                      src={formData.image_url} 
                      alt="Preview" 
                      className="image-preview"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div 
                    className="image-placeholder" 
                    style={{display: formData.image_url ? 'none' : 'flex'}}
                  >
                    📖
                  </div>
                </div>
            </div>
          </div>

          <div className="book-fields-section">
            <div className="form-grid">
              {/* column 1 */}
              <div className="form-column">
                <div className="form-group">
                  <label htmlFor="category_id">Category</label>
                  <select
                    id="category_id"
                    name="category_id"
                    value={formData.category_id || ''}
                    onChange={handleChange}
                  >
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                  {errors.category_id && <div className="error-text">{errors.category_id}</div>}
                </div>

                <div className="form-group">
                  <label htmlFor="title">Title</label>
                  <input 
                    id="title"
                    name="title"
                    value={formData.title || ''}
                    onChange={handleChange}
                  />
                  {errors.title && <div className="error-text">{errors.title}</div>}
                </div>

                <div className="form-group">
                  <label htmlFor="author">Author</label>
                  <input 
                    id="author"
                    name="author"
                    value={formData.author || ''}
                    onChange={handleChange}
                  />
                  {errors.author && <div className="error-text">{errors.author}</div>}
                </div>

                <div className="form-group">
                  <label htmlFor="price">Price</label>
                  <input 
                    id="price"
                    name="price"
                    type="number"
                    value={formData.price ?? ''}
                    onChange={handleChange}
                  />
                  {errors.price && <div className="error-text">{errors.price}</div>}
                </div>
              </div>

              {/* column 2 */}
              <div className="form-column">
                <div className="form-group">
                  <label htmlFor="stock_quantity">Stock Quantity</label>
                  <input 
                    id="stock_quantity"
                    name="stock_quantity"
                    type="number"
                    value={formData.stock_quantity ?? ''}
                    onChange={handleChange}
                  />
                  {errors.stock_quantity && <div className="error-text">{errors.stock_quantity}</div>}
                </div>
                <div className="form-group">
                  <label htmlFor="description">Description</label>
                  <textarea 
                    id="description"
                    name="description"
                    value={formData.description || ''}
                    onChange={handleChange}
                  />
                  {errors.description && <div className="error-text">{errors.description}</div>}
                </div>
                <div className="form-group">
                  <label htmlFor="image_url">Image URL</label>
                  <input 
                    id="image_url"
                    name="image_url"
                    value={formData.image_url || ''}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button onClick={handleSubmit}>Save</button>
          <button onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

export default BookPopup;
