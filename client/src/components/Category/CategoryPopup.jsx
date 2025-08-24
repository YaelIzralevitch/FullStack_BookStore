import { useState, useEffect } from 'react';
import './CategoryPopup.css';

function CategoryPopup({ category, onClose, onSave }) {
  const [formData, setFormData] = useState({
    id: null,
    name: '',
    image_url: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (category) setFormData(category);
  }, [category]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name?.trim()) newErrors.name = 'Category name is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return; 
    onSave(formData);
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <h3>{formData.id ? 'Edit Category' : 'Add Category'}</h3>

        <div className="form-group">
          <label htmlFor="name">Category Name</label>
          <input 
            id="name"
            name="name" 
            value={formData.name || ''}
            onChange={handleChange} 
          />
          {errors.name && <div className="error-text">{errors.name}</div>}
        </div>

        <div className="form-group">
          <label htmlFor="image_url">Image URL</label>
          <input 
            id="image_url"
            name="image_url" 
            value={formData.image_url || ''}
            onChange={handleChange} 
          />
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
                📂
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

export default CategoryPopup;
