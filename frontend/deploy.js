const API_URL = 'https://codespace-backend.onrender.com/api';

async function deployProject(projectId, platform) {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/deploy`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ projectId, platform })
        });
        
        const data = await response.json();
        if (data.success) {
            return data.deployment;
        } else {
            throw new Error(data.message || 'Deployment failed');
        }
    } catch (error) {
        console.error('Deploy error:', error);
        throw error;
    }
}

async function deployToVercel(projectId) {
    return await deployProject(projectId, 'vercel');
}

async function deployToNetlify(projectId) {
    return await deployProject(projectId, 'netlify');
}

async function deployToRender(projectId) {
    return await deployProject(projectId, 'render');
}

function showDeploymentStatus(deployment) {
    const status = document.createElement('div');
    status.className = 'deployment-status';
    status.innerHTML = `
        <h4>Deployment Status: ${deployment.status}</h4>
        <p>Platform: ${deployment.platform}</p>
        ${deployment.url ? `<p>URL: <a href="${deployment.url}" target="_blank">${deployment.url}</a></p>` : ''}
        ${deployment.logs ? `<pre>${deployment.logs}</pre>` : ''}
    `;
    document.body.appendChild(status);
}
