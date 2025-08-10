import { useEffect, useState } from 'react';
import { getCategories } from '../../../services/api';
import Category from '../../../components/Category/Category.jsx';
import './HomePage.css';

function HomePage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchCategories() {
      try {
        setLoading(true);
        const response = await getCategories();
        setCategories(response.data || []);
      } catch (err) {
        setError('Error loading categories');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchCategories();
  }, []);

  if (loading) return <p>Loading Categories...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="categories-page">
      <h2>Book's Categories</h2>
      <div className="categories-grid">
        {categories.map(cat => (
          <Category key={cat.id} category={cat} />
        ))}
      </div>
    </div>
  );
};

export default HomePage;
