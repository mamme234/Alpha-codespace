const API_URL = 'https://codespace-backend.onrender.com/api';

async function loadFileExplorer(projectId) {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/projects/${projectId}/files`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const data = await response.json();
        if (data.success) {
            renderExplorer(data.files);
        }
    } catch (error) {
        console.error('Load explorer error:', error);
    }
}

function renderExplorer(files) {
    const tree = document.getElementById('fileTree');
    const fileMap = {};
    
    files.forEach(file => {
        const parts = file.path.split('/');
        let current = fileMap;
        parts.forEach((part, index) => {
            if (index === parts.length - 1) {
                current[part] = { type: 'file', ...file };
            } else {
                if (!current[part]) current[part] = { type: 'folder', children: {} };
                current = current[part].children;
            }
        });
    });
    
    function buildTree(obj, path = '') {
        let html = '';
        const keys = Object.keys(obj);
        keys.sort();
        
        keys.forEach(key => {
            const item = obj[key];
            const fullPath = path ? `${path}/${key}` : key;
            
            if (item.type === 'folder') {
                html += `
                    <div class="folder" onclick="toggleFolder(this)">
                        <span>📁 ${key}</span>
                        <div class="folder-children">
                            ${buildTree(item.children, fullPath)}
                        </div>
                    </div>
                `;
            } else {
                html += `
                    <div class="file" onclick="openFile('${fullPath}')">
                        <span>📄 ${key}</span>
                    </div>
                `;
            }
        });
        
        return html;
    }
    
    tree.innerHTML = buildTree(fileMap) || '<p>Empty project</p>';
}

function toggleFolder(element) {
    const children = element.querySelector('.folder-children');
    if (children) {
        const isHidden = children.style.display === 'none';
        children.style.display = isHidden ? 'block' : 'none';
        if (isHidden) {
            element.querySelector('span').textContent = '📂 ' + element.querySelector('span').
