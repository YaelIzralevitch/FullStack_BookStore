export const saveUser = (user) => {
  localStorage.setItem('user', JSON.stringify(user));
};

export const getUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

export const removeUser = () => {
  localStorage.removeItem('user');
};

export const setAuthToken = (token) => {
  localStorage.setItem('authToken', token);
};

export const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

export const removeAuthToken = () => {
  localStorage.removeItem('authToken');
};

export const isTokenValid = () => {
  const token = getAuthToken();
  if (!token) return false;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const now = Date.now() / 1000;
    return payload.exp > now;
  } catch {
    return false;
  }
};



// Cart management

export function getCart() {
  const cart = localStorage.getItem('cart');
  return cart ? JSON.parse(cart) : [];
}

export function saveCart(cart) {
  localStorage.setItem('cart', JSON.stringify(cart));
}


export function addToCart(book, quantity = 1) {
  const cart = getCart();
  const existingBook = cart.find(item => item.bookId === book.bookId);
  
  if (existingBook) {
    existingBook.quantity += quantity;
  } else {
    cart.push({ ...book, quantity });
  }
  
  saveCart(cart);
}

export function removeFromCart(bookId) {
  const cart = getCart().filter(item => item.bookId !== bookId);
  saveCart(cart);
}

export function clearCart() {
  localStorage.removeItem('cart');
}


export default {
  saveUser,
  getUser,
  removeUser,
  setAuthToken,
  getAuthToken,
  removeAuthToken,
  isTokenValid,
  getCart,
  saveCart,
  addToCart,
  removeFromCart,
  clearCart,
};
