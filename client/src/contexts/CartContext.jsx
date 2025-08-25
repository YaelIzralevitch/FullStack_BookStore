import { createContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (book, quantity = 1) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === book.id);

      if (existingItem) {
        // ✅ מחשבים את הכמות החדשה, בלי לעבור את המלאי
        const newQuantity = Math.min(
          existingItem.quantity + quantity,
          book.stock_quantity
        );

        return prevItems.map(item =>
          item.id === book.id
            ? { ...item, quantity: newQuantity }
            : item
        );
      } else {
        // ✅ במידה וזה מוצר חדש, דואגים שלא לעבור את המלאי
        const initialQuantity = Math.min(quantity, book.stock_quantity);
        return [...prevItems, { ...book, quantity: initialQuantity }];
      }
    });
  };

  const removeFromCart = (bookId) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== bookId));
  };

  const updateQuantity = (bookId, newQuantity) => {
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === bookId
          ? {
              ...item,
              quantity: Math.min(
                newQuantity,
                item.stock_quantity // ✅ לא לעבור מלאי
              )
            }
          : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getCartItemsCount = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartItemsCount
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export default CartContext;
