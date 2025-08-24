import { useContext } from 'react';
import CartContext from '../../contexts/CartContext';
import { useNavigate } from 'react-router-dom';
import './NavCart.css'

function NavCart() {
  const { getCartItemsCount } = useContext(CartContext);
  const navigate = useNavigate();

  return (
    <div className="nav-cart" onClick={() => navigate('/home/cart')}>
      <img src="/src/assets/cart-icon.png" alt="Cart Icon" />
      <span className="cart-count">{getCartItemsCount()}</span>
    </div>
  );
}

export default NavCart;