const API_URL = 'https://codespace-backend.onrender.com/api';

let currentProjectId = null;
let currentFile = 'README.md';
let files = {};

document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    currentProjectId = params.get('project');
    
    if (currentProjectId) {
        loadWorkspace(currentProjectId);
    } else {
        createNewWorkspace();
    }
    
    setupEditor();
});

async function createNewWorkspace() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/projects`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                name: `Project-${Date.now()}`,
                language: 'javascript',
                template: 'default'
            })
        });
        
        const data = await response.json();
        if (data.success) {
            currentProjectId = data.project._id;
            loadWorkspace(currentProjectId);
        }
    } catch (error) {
        console.error('Create workspace error:', error);
    }
}

async function loadWorkspace(projectId) {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/projects/${projectId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const data = await response.json();
        if (data.success) {
            document.getElementById('workspaceTitle').textContent = data.project.name;
            loadFiles(projectId);
        }
    } catch (error) {
        console.error('Load workspace error:', error);
    }
}

async function loadFiles(projectId) {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/projects/${projectId}/files`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const data = await response.json();
        if (data.success) {
            files = {};
            data.files.forEach(f => {
                files[f.path] = f.content;
            });
            renderFileTree(data.files);
            openFile('README.md');
        }
    } catch (error) {
        console.error('Load files error:', error);
    }
}

function renderFileTree(fileList) {
    const tree = document.getElementById('fileTree');
    const folders = {};
    const files = fileList.filter(f => f.type === 'file');
    const foldersList = fileList.filter(f => f.type === 'folder');
    
    let html = '';
    foldersList.forEach(folder => {
        html += `
            <div class="folder" onclick="toggleFolder(this)">
                <span>📁 ${folder.path}</span>
                <div class="folder-children"></div>
            </div>
        `;
    });
    
    files.forEach(file => {
        html += `<div class="file" onclick="openFile('${file.path}')"><span>📄 ${file.path}</span></div>`;
    });
    
    tree.innerHTML = html || '<p>No files</p>';
}

function toggleFolder(element) {
    const children = element.querySelector('.folder-children');
    if (children) {
        children.style.display = children.style.display === 'none' ? 'block' : 'none';
    }
}

async function openFile(filePath) {
    currentFile = filePath;
    const content = files[filePath] || '# New File\n\nStart coding!';
    document.getElementById('editorCode').textContent = content;
    updateLineNumbers(content);
    
    // Update tab
    const tabs = document.getElementById('editorTabs');
    const tab = tabs.querySelector('.tab.active');
    if (tab) tab.textContent = filePath;
}

function updateLineNumbers(content) {
    const lines = content.split('\n').length;
    const numbers = Array.from({ length: lines }, (_, i) => i + 1).join('\n');
    document.getElementById('lineNumbers').textContent = numbers;
}

function setupEditor() {
    const editor = document.getElementById('editorCode');
    editor.addEventListener('input', function() {
        updateLineNumbers(this.textContent);
        files[currentFile] = this.textContent;
        saveFile(currentFile, this.textContent);
    });
}

async function saveFile(filePath, content) {
    if (!currentProjectId) return;
    try {
        const token = localStorage.getItem('token');
        await fetch(`${API_URL}/projects/${currentProjectId}/files`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ path: filePath, content })
        });
    } catch (error) {
        console.error('Save error:', error);
    }
}

async function newFile() {
    const name = prompt('Enter file name:');
    if (!name) return;
    try {
        const token = localStorage.getItem('token');
        await fetch(`${API_URL}/projects/${currentProjectId}/files`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ path: name, content: '' })
        });
        loadFiles(currentProjectId);
    } catch (error) {
        console.error('Create file error:', error);
    }
}

function toggleTerminal() {
    const terminal = document.getElementById('terminal');
    terminal.style.display = terminal.style.display === 'none' ? 'flex' : 'none';
}

function togglePreview() {
    const preview = document.getElementById('previewPanel');
    preview.style.display = preview.style.display === 'none' ? 'flex' : 'none';
    if (preview.style.display === 'flex') {
        updatePreview();
    }
}

function updatePreview() {
    const content = document.getElementById('editorCode').textContent;
    const frame = document.getElementById('previewFrame');
    const html = content.includes('<html>') ? content : 
        `<!DOCTYPE html><html><head><title>Preview</title></head><body>${content}</body></html>`;
    frame.src = 'data:text/html;charset=utf-8,' + encodeURIComponent(html);
}

function showDeploy() {
    const platform = prompt('Deploy to (vercel/netlify/render):');
    if (platform) {
        deployProject(platform);
    }
}

async function deployProject(platform) {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/deploy`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ projectId: currentProjectId, platform })
        });
        
        const data = await response.json();
        if (data.success) {
            alert(`Deployed successfully! URL: ${data.deployment.url || 'Check deployment status'}`);
        }
    } catch (error) {
        console.error('Deploy error:', error);
        alert('Deployment failed.');
    }
}

function openAI() {
    const question = prompt('Ask AI something about your code:');
    if (question) {
        askAI(question);
    }
}

async function askAI(question) {
    try {
        const token = localStorage.getItem('token');
        const code = document.getElementById('editorCode').textContent;
        const response = await fetch(`${API_URL}/ai/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ message: question, code })
        });
        
        const data = await response.json();
        if (data.success) {
            alert(`🤖 AI Response:\n\n${data.response}`);
        }
    } catch (error) {
        console.error('AI error:', error);
        alert('AI service error.');
    }
}

function terminalCommand(event) {
    if (event.key === 'Enter') {
        const input = document.getElementById('terminalInput');
        const output = document.getElementById('terminalOutput');
        const command = input.value;
        
        output.innerHTML += `<br><span class="prompt">$</span> <span class="cmd">${command}</span>`;
        input.value = '';
        
        // Simulate command execution
        if (command === 'ls') {
            output.innerHTML += '<br>README.md  src/  package.json';
        } else if (command === 'npm start') {
            output.innerHTML += '<br>🚀 Starting server...';
            setTimeout(() => {
                output.innerHTML += '<br>✅ Server running on http://localhost:3000';
                output.scrollTop = output.scrollHeight;
            }, 1000);
        } else if (command.startsWith('echo')) {
            output.innerHTML += `<br>${command.replace('echo ', '')}`;
        } else if (command) {
            output.innerHTML += `<br>Command not found: ${command}`;
        }
        
        output.scrollTop = output.scrollHeight;
    }
}

// Git functions
async function gitCommit() {
    const message = prompt('Commit message:');
    if (message) {
        alert(`Committed: ${message}`);
    }
}

async function gitPush() {
    alert('Pushing to remote...');
    setTimeout(() => alert('Push completed!'), 1500);
}

async function gitPull() {
    alert('Pulling from remote...');
    setTimeout(() => alert('Pull completed!'), 1500);
                  }
