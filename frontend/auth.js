const API_URL = 'https://codespace-backend.onrender.com/api';

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
});

async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (data.success) {
            localStorage.setItem('token', data.token);
            window.location.href = '/dashboard.html';
        } else {
            alert(data.message || 'Login failed');
        }
    } catch (error) {
        alert('Network error. Please try again.');
    }
}

async function handleRegister(e) {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (password !== confirmPassword) {
        alert('Passwords do not match');
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password })
        });
        
        const data = await response.json();
        
        if (data.success) {
            localStorage.setItem('token', data.token);
            window.location.href = '/dashboard.html';
        } else {
            alert(data.message || 'Registration failed');
        }
    } catch (error) {
        alert('Network error. Please try again.');
    }
}

function handleGithubLogin() {
    window.location.href = `${API_URL}/auth/github`;
}

function handleGoogleLogin() {
    window.location.href = `${API_URL}/auth/google`;
          }
