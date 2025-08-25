import { Link } from 'react-router-dom';
import './Category.css';

const Category = ({ category }) => {
  return (
    <Link to={`/home/categories/${category.id}`}
          state={{ categoryName: category.name }} 
          className="category-card">
      
      <div className="category-image-wrapper">
        <img 
          src={category.image_url || "https://i.pinimg.com/1200x/67/41/01/674101e0187b34ce24feda85191c2ac9.jpg"}
          alt={category.name} 
          className="category-image" 
        />
      </div>
      <div className="category-name">{category.name}</div>
    </Link>
  );
};

export default Category;
