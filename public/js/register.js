// Registration function
async function register() {
    console.log('Register function called');
    
    // Get form values
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const email = document.getElementById('email').value;
    const role = document.querySelector('input[name="role"]:checked').value;
    
    console.log('Username:', username);
    console.log('Email:', email);
    console.log('Role:', role);
    
    // Validate password
    if (password !== confirmPassword) {
        alert('Passwords do not match!');
        return;
    }
    
    try {
        // Check if username exists in Firestore
        const users = await getAllUsers();
        if (users.some(u => u.username === username)) {
            alert('Username already exists!');
            return;
        }
        
        // Create new user
        const newUser = {
            username: username,
            password: password,
            email: email,
            role: role
        };
        
        // Add user to Firestore
        await addUser(newUser);
        
        console.log('User registered successfully');
        alert('Registration successful! Please login.');
        window.location.href = 'login.html';
    } catch (error) {
        console.error('Registration error:', error);
        alert('Error during registration. Please try again.');
    }
}

import { initializeStorage, getAllUsers, addUser } from './storage.js';

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
    
    // Get registration form element
    const registerForm = document.getElementById('registerForm');
    console.log('Register form element:', registerForm);
    
    if (registerForm) {
        // Add submit event listener to form
        registerForm.addEventListener('submit', function(event) {
            console.log('Form submit event triggered');
            event.preventDefault();
            register();
        });
    } else {
        console.error('Register form element not found');
    }
});
