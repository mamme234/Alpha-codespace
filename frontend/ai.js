const API_URL = 'https://codespace-backend.onrender.com/api';

async function askAI(prompt, code = '') {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/ai/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ message: prompt, code })
        });
        
        const data = await response.json();
        if (data.success) {
            return data.response;
        } else {
            throw new Error(data.message || 'AI request failed');
        }
    } catch (error) {
        console.error('AI error:', error);
        return `Error: ${error.message}`;
    }
}

async function generateCode(prompt, language = 'javascript') {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/ai/generate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ prompt, language })
        });
        
        const data = await response.json();
        return data.code || data.response || 'Generation failed';
    } catch (error) {
        console.error('Generate code error:', error);
        return `Error: ${error.message}`;
    }
}

async function fixCode(code, error = '') {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/ai/fix`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ code, error })
        });
        
        const data = await response.json();
        return data.fixedCode || data.response || 'Fix failed';
    } catch (error) {
        console.error('Fix code error:', error);
        return `Error: ${error.message}`;
    }
}

async function explainCode(code, language = 'javascript') {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/ai/explain`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ code, language })
        });
        
        const data = await response.json();
        return data.explanation || data.response || 'Explanation failed';
    } catch (error) {
        console.error('Explain code error:', error);
        return `Error: ${error.message}`;
    }
                           }
