const API_URL = 'https://codespace-backend.onrender.com/api';

async function connectGithub() {
    window.open(`${API_URL}/auth/github`, '_blank');
}

async function importFromGithub(repoUrl) {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/github/import`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ repoUrl })
        });
        
        const data = await response.json();
        if (data.success) {
            return data.project;
        } else {
            throw new Error(data.message || 'Import failed');
        }
    } catch (error) {
        console.error('Import error:', error);
        throw error;
    }
}

async function exportToGithub(projectId, repoName) {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/github/export`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ projectId, repoName })
        });
        
        const data = await response.json();
        if (data.success) {
            return data.repoUrl;
        } else {
            throw new Error(data.message || 'Export failed');
        }
    } catch (error) {
        console.error('Export error:', error);
        throw error;
    }
}

async function getGithubRepos() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/github/repos`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const data = await response.json();
        return data.repos || [];
    } catch (error) {
        console.error('Get repos error:', error);
        return [];
    }
}
