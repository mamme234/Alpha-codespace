let terminalSocket = null;

function connectTerminal() {
    const ws = new WebSocket('wss://codespace-backend.onrender.com');
    
    ws.onopen = () => {
        ws.send(JSON.stringify({ type: 'terminal:start' }));
    };
    
    ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'terminal:output') {
            appendTerminalOutput(data.data);
        }
    };
    
    ws.onclose = () => {
        appendTerminalOutput('\n[Disconnected]');
        setTimeout(connectTerminal, 3000);
    };
    
    return ws;
}

function appendTerminalOutput(text) {
    const output = document.getElementById('terminalOutput');
    output.innerHTML += text;
    output.scrollTop = output.scrollHeight;
}

function sendTerminalCommand(command) {
    if (terminalSocket && terminalSocket.readyState === WebSocket.OPEN) {
        terminalSocket.send(JSON.stringify({ 
            type: 'terminal:input', 
            data: command 
        }));
    }
}

// Initialize terminal
document.addEventListener('DOMContentLoaded', () => {
    terminalSocket = connectTerminal();
});
