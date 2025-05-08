// postService.js
import axios from 'axios';
import { API_BASE_URL } from '../config/api';

// Local storage helpers
const getPostsFromLocalStorage = () => {
  try {
    const posts = localStorage.getItem('posts');
    return posts ? JSON.parse(posts) : [];
  } catch (error) {
    console.error('Error getting posts from localStorage:', error);
    return [];
  }
};

const savePostsToLocalStorage = (posts) => {
  try {
    localStorage.setItem('posts', JSON.stringify(posts));
  } catch (error) {
    console.error('Error saving posts to localStorage:', error);
  }
};

export const getPosts = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/posts`);
    const posts = response.data;
    savePostsToLocalStorage(posts);
    return posts;
  } catch (error) {
    console.error('Error fetching posts from API:', error);
    
    // Fallback to localStorage
    const localPosts = getPostsFromLocalStorage();
    if (localPosts.length > 0) {
      return localPosts;
    }
    throw error;
  }
};

export const createPost = async (postData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/posts`, postData);
    const newPost = response.data;
    
    // Update localStorage
    const localPosts = getPostsFromLocalStorage();
    savePostsToLocalStorage([...localPosts, newPost]);
    
    return newPost;
  } catch (error) {
    console.error('Error creating post through API:', error);
    
    // Fallback to local storage
    const localPosts = getPostsFromLocalStorage();
    const newPost = {
      ...postData,
      id: `local-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    
    savePostsToLocalStorage([...localPosts, newPost]);
    return newPost;
  }
};

export const updatePost = async (id, postData) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/api/posts/${id}`, postData);
    const updatedPost = response.data;
    
    // Update localStorage
    const localPosts = getPostsFromLocalStorage();
    const updatedPosts = localPosts.map(post => 
      post.id === id ? updatedPost : post
    );
    savePostsToLocalStorage(updatedPosts);
    
    return updatedPost;
  } catch (error) {
    console.error('Error updating post through API:', error);
    
    // Fallback to local storage
    const localPosts = getPostsFromLocalStorage();
    const post = localPosts.find(p => p.id === id);
    
    if (!post) throw new Error('Post not found');
    
    const updatedPost = { ...post, ...postData };
    const updatedPosts = localPosts.map(p => 
      p.id === id ? updatedPost : p
    );
    
    savePostsToLocalStorage(updatedPosts);
    return updatedPost;
  }
};

export const deletePost = async (id) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/api/posts/${id}`);
    
    // Update localStorage
    const localPosts = getPostsFromLocalStorage();
    const updatedPosts = localPosts.filter(post => post.id !== id);
    savePostsToLocalStorage(updatedPosts);
    
    return response.data;
  } catch (error) {
    console.error('Error deleting post through API:', error);
    
    // Fallback to local storage
    const localPosts = getPostsFromLocalStorage();
    const updatedPosts = localPosts.filter(post => post.id !== id);
    savePostsToLocalStorage(updatedPosts);
    
    return { success: true, message: 'Post deleted locally' };
  }
};
