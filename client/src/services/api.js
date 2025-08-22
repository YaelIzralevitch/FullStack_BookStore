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
    
    const res = await fetch(`${API_URL}/${endpoint}`, { 
      method: 'GET',
      headers
     });
    const responseData = await res.json();

    if (!res.ok) throw new Error(responseData.message || JSON.stringify(responseData)); 
    return responseData;

  } catch (error) {
    console.error(`Error fetching ${endpoint}:`, error);
    throw error;
  }
};

// פונקציה גנרית לביצוע בקשות POST עם טיפול בשגיאות
export const postData = async (endpoint, data) => {
  try {
    const token = getAuthToken();
    const headers = { 'Content-Type': 'application/json' };
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const res = await fetch(`${API_URL}/${endpoint}`, {
      method: 'POST',
      headers,
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
    const responseData = await res.json();
    if (!res.ok) throw new Error(responseData.message || `PUT ${endpoint} failed`);
    return responseData;
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
    const responseData = await res.json();
    if (!res.ok) throw new Error(responseData.message || `DELETE ${endpoint} failed`);
    return responseData;
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
export const saveUserCreditCard = async (userId, cardData) => await postData(`cards/${userId}`, cardData);

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


//מנהל
export const getDashboardData = async (year) => {
  const endpoint = year ? `dashboard?year=${year}` : 'dashboard';
  return await fetchData(endpoint);
};
export const getAvailableYears = async () => await fetchData('dashboard/years');


// הזמנות מנהל
export const getAllOrdersForAdmin = async (params = {}) => {
  const searchParams = new URLSearchParams();
  
  Object.keys(params).forEach(key => {
    if (params[key]) {
      searchParams.append(key, params[key]);
    }
  });
  
  const endpoint = searchParams.toString() ? `orders/admin?${searchParams}` : 'orders/admin';
  return await fetchData(endpoint);
};
export const updateOrderStatus = async (orderId, status) => await updateData('orders/admin', `${orderId}/status`, { status });
export const getOrderDetailsForAdmin = async (orderId) => await fetchData(`orders/admin/${orderId}`);
