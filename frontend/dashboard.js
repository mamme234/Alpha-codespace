const API_URL = 'https://codespace-backend.onrender.com/api';

document.addEventListener('DOMContentLoaded', () => {
    loadProjects();
    loadStorage();
});

async function loadProjects() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/projects`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const data = await response.json();
        
        if (data.success && data.projects) {
            const grid = document.getElementById('projectGrid');
            grid.innerHTML = data.projects.map(p => `
                <div class="project-card" onclick="openWorkspace('${p._id}')">
                    <div class="project-icon">📁</div>
                    <h4>${p.name}</h4>
                    <p>${p.description || 'No description'}</p>
                    <div class="project-tags">
                        <span class="tag">${p.language || 'javascript'}</span>
                        ${p.framework ? `<span class="tag">${p.framework}</span>` : ''}
                    </div>
                </div>
            `).join('') || '<p>No projects yet. Create your first workspace!</p>';
        }
    } catch (error) {
        console.error('Load projects error:', error);
    }
}

async function loadStorage() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/storage`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const data = await response.json();
        
        if (data.success) {
            const usedGB = (data.usage / 1024 / 1024 / 1024).toFixed(2);
            const limitGB = (data.limit / 1024 / 1024 / 1024).toFixed(1);
            const percentage = (data.usage / data.limit) * 100;
            
            document.getElementById('storageProgress').style.width = Math.min(percentage, 100) + '%';
            document.getElementById('storageText').textContent = `${usedGB} GB / ${limitGB} GB`;
        }
    } catch (error) {
        console.error('Storage error:', error);
    }
}
