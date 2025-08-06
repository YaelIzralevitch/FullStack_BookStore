import { saveUser } from '../utils/localStorage'

//import axios from 'axios';
const API_URL = 'http://localhost:3001/api';

// פונקציה גנרית לביצוע בקשות GET
export const fetchData = async (endpoint) => {
  try {
    const res = await fetch(`${API_URL}/${endpoint}`);
    if (!res.ok) throw new Error(`GET ${endpoint} failed`);
    return await res.json();
  } catch (error) {
    console.error(`Error fetching ${endpoint}:`, error);
    throw error;
  }
};

// פונקציה גנרית לביצוע בקשות POST
export const postData = async (endpoint, data) => {
  try {
    const res = await fetch(`${API_URL}/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`POST ${endpoint} failed`);
    return await res.json();
  } catch (error) {
    console.error(`Error posting to ${endpoint}:`, error);
    throw error;
  }
};

// פונקציה גנרית לביצוע בקשות PUT
export const updateData = async (endpoint, id, data) => {
  try {
    const res = await fetch(`${API_URL}/${endpoint}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
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
export const deleteData = async (endpoint, id) => {
  try {
    const res = await fetch(`${API_URL}/${endpoint}/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error(`DELETE ${endpoint}/${id} failed`);
    return res.json();
  } catch (error) {
    console.error(`Error deleting ${endpoint}/${id}:`, error);
    throw error;
  }
};

// ======= פונקציות ספציפיות =======

//התחברות והרשמה
export const Login = async (userData) => await postData('auth/login', userData);

// משתמשים
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
