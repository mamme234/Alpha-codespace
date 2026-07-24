const Docker = require('dockerode');
const docker = new Docker();

async function createContainer(projectPath, language = 'node') {
  try {
    const imageMap = {
      'node': 'node:18-alpine',
      'python': 'python:3.11-alpine',
      'php': 'php:8.2-alpine',
      'java': 'openjdk:17-alpine',
      'go': 'golang:1.21-alpine'
    };

    const image = imageMap[language] || 'node:18-alpine';
    
    const container = await docker.createContainer({
      Image: image,
      Tty: true,
      WorkingDir: '/app',
      HostConfig: {
        Binds: [`${projectPath}:/app`],
        Memory: 1024 * 1024 * 1024, // 1GB
        MemorySwap: 0
      }
    });

    await container.start();
    
    return {
      id: container.id,
      status: 'running'
    };
  } catch (error) {
    console.error('Container creation error:', error);
    throw error;
  }
}

async function stopContainer(containerId) {
  try {
    const container = docker.getContainer(containerId);
    await container.stop();
    await container.remove();
    return { status: 'stopped' };
  } catch (error) {
    console.error('Container stop error:', error);
    throw error;
  }
}

async function getContainerStatus(containerId) {
  try {
    const container = docker.getContainer(containerId);
    const info = await container.inspect();
    return {
      id: containerId,
      status: info.State.Status,
      running: info.State.Running
    };
  } catch (error) {
    return { id: containerId, status: 'not found', running: false };
  }
}

module.exports = { createContainer, stopContainer, getContainerStatus };
