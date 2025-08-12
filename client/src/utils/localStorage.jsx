// שמירת המשתמש ב-localStorage
export const saveUser = (user) => {
  localStorage.setItem('user', JSON.stringify(user));
};

// קבלת המשתמש מ-localStorage
export const getUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

// מחיקת המשתמש מ-localStorage
export const removeUser = () => {
  localStorage.removeItem('user');
};

export const setAuthToken = (token) => {
  localStorage.setItem('authToken', token);
};

// קבלת הטוקן מlocalStorage
export const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

// הסרת הטוקן
export const removeAuthToken = () => {
  localStorage.removeItem('authToken');
};

// בדיקה האם הטוקן תקף (לא פג תוקף)
export const isTokenValid = () => {
  const token = getAuthToken();
  if (!token) return false;
  
  try {
    // פענוח הטוקן לבדיקת תאריך התפוגה
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

