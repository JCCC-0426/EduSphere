// Login function
async function login() {
    console.log('Login function called');
    
    // Get username and password from input
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    console.log('Username:', username);
    console.log('Password:', password);
    
    // Simple form validation
    if (!username || !password) {
        alert('Please enter both username and password');
        return;
    }
    
    try {
        // Get user from Firestore
        const users = await getAllUsers();
        console.log('Current users from Firestore:', users);
        
        // Find matching user
        const user = users.find(u => u.username === username && u.password === password);
        console.log('Found user:', user);
        
        if (user) {
            // Save current user info in session
            sessionStorage.setItem('currentUser', JSON.stringify(user));
            
            // Redirect based on role
            if (user.role === 'student') {
                window.location.href = 'student.html';
            } else {
                window.location.href = 'teacher.html';
            }
        } else {
            alert('Invalid username or password!');
        }
    } catch (error) {
        console.error('Login error:', error);
        alert('Error during login. Please try again.');
    }
}

import { initializeStorage, getAllUsers } from './storage.js';

// Wait for DOM to load
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded');
    
    // Initialize Firestore
    if (typeof initializeStorage === 'function') {
        console.log('Initializing Firestore...');
        initializeStorage().catch(error => {
            console.error('Firestore initialization error:', error);
        });
    }
    
    // Get login form element
    const loginForm = document.getElementById('loginForm');
    console.log('Login form element:', loginForm);
    
    if (loginForm) {
        // Add submit event listener to form
        loginForm.addEventListener('submit', function(event) {
            console.log('Form submit event triggered');
            event.preventDefault();
            login();
        });
    } else {
        console.error('Login form element not found');
    }
});
