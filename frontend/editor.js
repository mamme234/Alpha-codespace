const API_URL = 'https://codespace-backend.onrender.com/api';

let editorContent = '';
let currentFilePath = '';

async function saveCurrentFile() {
    if (!currentFilePath || !currentProjectId) return;
    try {
        const token = localStorage.getItem('token');
        const content = document.getElementById('editorCode').textContent;
        
        await fetch(`${API_URL}/projects/${currentProjectId}/files`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ path: currentFilePath, content })
        });
    } catch (error) {
        console.error('Auto-save error:', error);
    }
}

// Auto-save every 5 seconds
setInterval(saveCurrentFile, 5000);

async function openFile(filePath) {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/projects/${currentProjectId}/files`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const data = await response.json();
        if (data.success) {
            const file = data.files.find(f => f.path === filePath);
            if (file) {
                currentFilePath = filePath;
                document.getElementById('editorCode').textContent = file.content || '';
                updateLineNumbers(file.content || '');
                updateActiveTab(filePath);
            }
        }
    } catch (error) {
        console.error('Open file error:', error);
    }
}

function updateActiveTab(filePath) {
    const tabs = document.querySelectorAll('.editor-tabs .tab');
    tabs.forEach(tab => {
        tab.classList.remove('active');
        if (tab.textContent === filePath) {
            tab.classList.add('active');
        }
    });
}

function addFileTab(filePath) {
    const tabs = document.getElementById('editorTabs');
    const tab = document.createElement('div');
    tab.className = 'tab';
    tab.textContent = filePath;
    tab.onclick = () => openFile(filePath);
    tabs.insertBefore(tab, tabs.querySelector('.tab-add'));
}

async function createNewFile(filePath, content = '') {
    try {
        const token = localStorage.getItem('token');
        await fetch(`${API_URL}/projects/${currentProjectId}/files`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ path: filePath, content })
        });
        loadFiles(currentProjectId);
    } catch (error) {
        console.error('Create file error:', error);
    }
}

async function deleteFile(filePath) {
    if (!confirm(`Delete ${filePath}?`)) return;
    try {
        const token = localStorage.getItem('token');
        await fetch(`${API_URL}/projects/${currentProjectId}/files`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ path: filePath })
        });
        loadFiles(currentProjectId);
    } catch (error) {
        console.error('Delete file error:', error);
    }
          }
