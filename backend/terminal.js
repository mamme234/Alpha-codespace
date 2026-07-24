const { spawn } = require('child_process');

class TerminalSession {
  constructor(socketId) {
    this.socketId = socketId;
    this.process = null;
  }

  start(shell = 'bash') {
    this.process = spawn(shell, [], {
      cwd: process.cwd(),
      env: process.env,
      shell: true
    });

    this.process.stdout.on('data', (data) => {
      console.log(`Terminal ${this.socketId}:`, data.toString());
    });

    this.process.stderr.on('data', (data) => {
      console.error(`Terminal ${this.socketId} error:`, data.toString());
    });

    this.process.on('exit', (code) => {
      console.log(`Terminal ${this.socketId} exited with code ${code}`);
    });
  }

  write(command) {
    if (this.process && this.process.stdin) {
      this.process.stdin.write(command + '\n');
    }
  }

  kill() {
    if (this.process) {
      this.process.kill();
      this.process = null;
    }
  }

  isRunning() {
    return this.process !== null && !this.process.killed;
  }
}

const sessions = new Map();

function terminalHandler(io, socket) {
  socket.on('terminal:start', () => {
    const session = new TerminalSession(socket.id);
    session.start();
    sessions.set(socket.id, session);
    socket.emit('terminal:started', 'Terminal started');
  });

  socket.on('terminal:input', (command) => {
    const session = sessions.get(socket.id);
    if (session && session.isRunning()) {
      session.write(command);
    }
  });

  socket.on('terminal:kill', () => {
    const session = sessions.get(socket.id);
    if (session) {
      session.kill();
      sessions.delete(socket.id);
      socket.emit('terminal:killed', 'Terminal closed');
    }
  });

  socket.on('disconnect', () => {
    const session = sessions.get(socket.id);
    if (session) {
      session.kill();
      sessions.delete(socket.id);
    }
  });
}

module.exports = terminalHandler;
