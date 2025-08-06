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

// Creates a cookie with the specified name, valid for 24 hours
export const setCookie = (name) => {
    const date = new Date();
    date.setTime(date.getTime() + (1 * 24 * 60 * 60 * 1000));
    document.cookie = `${name}=true; expires=${date.toUTCString()}; path=/`;
}

// Checks if a cookie with the specified name exists
export const getCookie = (name) => {
    const cookies = document.cookie.split("; ");
    for (const cookie of cookies) {
        const [key, _ ] = cookie.split("=");
        if (key === name) return true;
    }
    return false;
}