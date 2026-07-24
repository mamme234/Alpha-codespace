// Use relative URL since both are on same domain
const API_URL = '/api';  // Changed from https://codespace-backend.onrender.com/api

document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    const publicPages = ['/login.html', '/register.html'];
    const currentPage = window.location.pathname;
    
    if (!token && !publicPages.includes(currentPage)) {
        window.location.href = '/login.html';
    }
    
    if (token && publicPages.includes(currentPage)) {
        window.location.href = '/dashboard.html';
    }
    
    if (token) {
        loadUserProfile();
    }
    
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
});

async function loadUserProfile() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/auth/profile`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
            const data = await response.json();
            if (data.success) {
                const user = data.user;
                const display = document.getElementById('userDisplay');
                if (display) display.textContent = user.username;
            }
        } else {
            localStorage.removeItem('token');
            window.location.href = '/login.html';
        }
    } catch (error) {
        console.error('Profile error:', error);
    }
}

async function handleLogout(e) {
    e.preventDefault();
    try {
        const token = localStorage.getItem('token');
        await fetch(`${API_URL}/auth/logout`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });
    } catch (error) {
        console.error('Logout error:', error);
    }
    localStorage.removeItem('token');
    window.location.href = '/login.html';
}

function createWorkspace() {
    window.location.href = '/workspace.html';
}

function openWorkspace(projectId) {
    window.location.href = `/workspace.html?project=${projectId}`;
}

function importFromGitHub() {
    window.open('https://github.com/login/oauth/authorize?client_id=your-client-id', '_blank');
}

function uploadZip() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.zip';
    input.onchange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            const formData = new FormData();
            formData.append('file', file);
            // Upload logic
        }
    };
    input.click();
}

function createTemplate() {
    alert('Template selection coming soon!');
}

export { API_URL };
