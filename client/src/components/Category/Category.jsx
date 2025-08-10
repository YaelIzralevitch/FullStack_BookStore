import { Link } from 'react-router-dom';
import './Category.css';

const Category = ({ category }) => {
  return (
    <Link to={`/home/categories/${category.id}`} className="category-card">
      <div className="category-image-wrapper">
        <img 
          src={category.image_url} 
          alt={category.name} 
          className="category-image" 
        />
      </div>
      <div className="category-name">{category.name}</div>
    </Link>
  );
};

export default Category;
