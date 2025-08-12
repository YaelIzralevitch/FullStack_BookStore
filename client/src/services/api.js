//import axios from 'axios';
import { getAuthToken, setAuthToken } from '../utils/localStorage'; 
const API_URL = 'http://localhost:3001/api';

// פונקציה גנרית לביצוע בקשות GET
export const fetchData = async (endpoint) => {
  try {
    const token = getAuthToken();
    const headers = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    
    const res = await fetch(`${API_URL}/${endpoint}`, { headers });
    if (!res.ok) throw new Error(`GET ${endpoint} failed`);
    return await res.json();
  } catch (error) {
    console.error(`Error fetching ${endpoint}:`, error);
    throw error;
  }
};

// פונקציה גנרית לביצוע בקשות POST עם טיפול בשגיאות
export const postData = async (endpoint, data) => {
  try {
    const token = getAuthToken();
    const res = await fetch(`${API_URL}/${endpoint}`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify(data),
    });
    
    const responseData = await res.json();
    
    // אם הסטטוס קוד לא בסדר, זרוק שגיאה עם המסר מהשרת
    if (!res.ok) {
      throw new Error(responseData.message || `POST ${endpoint} failed`);
    }
    
    return responseData;
  } catch (error) {
    console.error(`Error posting to ${endpoint}:`, error);
    // זרוק את השגיאה הלאה כדי שהקומפוננט יוכל לטפל בה
    throw error;
  }
};

// פונקציה גנרית לביצוע בקשות PUT
export const updateData = async (endpoint, id, data) => {
  try {
    const token = getAuthToken();
    const headers = { 'Content-Type': 'application/json' };
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    
    const res = await fetch(`${API_URL}/${endpoint}/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`PUT ${endpoint}/${id} failed`);
    return await res.json();
  } catch (error) {
    console.error(`Error updating ${endpoint}/${id}:`, error);
    throw error;
  }
};

// פונקציה גנרית לביצוע בקשות DELETE
export const deleteData = async (endpoint) => {
  try {
    const token = getAuthToken();
    const headers = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    
    const res = await fetch(`${API_URL}/${endpoint}`, {
      method: 'DELETE',
      headers,
    });
    if (!res.ok) throw new Error(`DELETE ${endpoint} failed`);
    return res.json();
  } catch (error) {
    console.error(`Error deleting ${endpoint}:`, error);
    throw error;
  }
};

// ======= פונקציות ספציפיות =======

//התחברות והרשמה
export const Login = async (userData) =>{
  const response = await postData('auth/login', userData);

  if (response.success && response.token) {
    setAuthToken(response.token);
  }

  return response;
} 

export const Register = async (userData) => await postData('auth/register', userData);

// כרטיסי אשראי
export const getUserCreditCard = async (userId) => await fetchData(`cards/${userId}`);
export const deleteUserCreditCard = async (userId) => await deleteData(`cards/${userId}`);
export const addUserCreditCard = async (userId, cardData) => await postData(`cards/${userId}`, cardData);

// משתמשים
export const updateUserDetails = async (userId, userData) => await updateData('users', userId, userData);


// קטגוריות
export const getCategories = () => fetchData('categories');
export const getCategoryById = (id) => fetchData(`categories/${id}`);
export const createCategory = (data) => postData('categories', data);
export const updateCategory = (id, data) => updateData('categories', id, data);
export const deleteCategory = (id) => deleteData('categories', id);


// ספרים
export const getBooksByCategoryId = (categoryId) => fetchData(`books/category/${categoryId}`);
export const getBookById = (bookId) => fetchData(`books/${bookId}`)


// הזמנות
export const getUserOrderHistory = async (userId) => await fetchData(`orders/user/${userId}`);
export const getOrderDetails = async (orderId, userId) => await fetchData(`orders/${orderId}/user/${userId}`);
export const createOrder = async (orderData, paymentData) => await postData('orders/checkout', { orderData, paymentData });

// חיפוש
export const searchBooksAndCategories = (query) => fetchData(`search?query=${encodeURIComponent(query)}`);






export const getUsers = () => fetchData('users');
export const getUserById = (userId) => fetchData(`users/${userId}`);
export const getUserByEmail = async (email) => {
  try {
    const res = await fetch(`${API_URL}/users?email=${email}`);
    if (!res.ok) throw new Error(`GET users by email failed`);
    const data = await res.json();
    return data[0];
  } catch (error) {
    console.error('Error fetching user by username:', error);
    throw error;
  }
};
export const createUser = (userData) => postData('users', userData);

// משימות
export const getTodosByUserId = (userId) => fetchData(`todos?userId=${userId}`);
export const createTodo = (todoData) => postData('todos', todoData);
export const updateTodo = (todoId, todoData) => updateData('todos', todoId, todoData);
export const deleteTodo = (todoId) => deleteData('todos', todoId);

// פוסטים
export const getPostsByUserId = (userId) => fetchData(`posts?userId=${userId}`);
export const getPostById = (postId) => fetchData(`posts/${postId}`);
export const createPost = (data) => postData('posts', data);
export const updatePost = (postId, postData) => updateData('posts', postId, postData);
export const deletePost = (postId) => deleteData('posts', postId);

// תגובות
export const getCommentsByPostId = (postId) => fetchData(`comments?postId=${postId}`);
export const createComment = (commentData) => postData('comments', commentData);
export const deleteCommentsByPostId = async (postId) => {
  try {
    const comments = await getCommentsByPostId(postId);
    
    // מחיקה של כל תגובה בלולאה
    await Promise.all(
      comments.map(comment =>
        deleteData('comments', comment.id)
      )
    );
  } catch (error) {
    console.error(`Error deleting comments for post ${postId}:`, error);
    throw error;
  }
};


// תמונות
export const getPhotosByAlbumIdPaged = async (albumId, page = 1, limit = 15) => {

  const start = (page - 1) * limit;
  const res = await fetch(`${API_URL}/photos?albumId=${albumId}&_start=${start}&_limit=${limit}`);
  if (!res.ok) throw new Error('Failed to fetch paged photos');
  
  return res.json();
};


export const getPhotosByAlbumId = (albumId) => fetchData(`photos?albumId=${albumId}`);

export const deletePhotosByAlbumId = async (albumId) => {
  try {
    const photos = await getPhotosByAlbumId(albumId);
    
    // מחיקה של כל תגובה בלולאה
    await Promise.all(
      photos.map(photo =>
        deleteData('photos', photo.id)
      )
    );
  } catch (error) {
    console.error(`Error deleting photos for album ${albumId}:`, error);
    throw error;
  }
};
