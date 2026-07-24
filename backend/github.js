const axios = require('axios');
const simpleGit = require('simple-git');
const fs = require('fs-extra');
const path = require('path');

async function createGithubRepo(accessToken, name, description = '') {
  try {
    const response = await axios.post('https://api.github.com/user/repos', {
      name,
      description,
      private: false,
      auto_init: true
    }, {
      headers: {
        'Authorization': `token ${accessToken}`,
        'Accept': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Create repo error:', error.response?.data || error.message);
    throw error;
  }
}

async function cloneRepo(repoUrl, localPath) {
  try {
    const git = simpleGit();
    await git.clone(repoUrl, localPath);
    return localPath;
  } catch (error) {
    console.error('Clone repo error:', error);
    throw error;
  }
}

async function pushChanges(localPath, commitMessage = 'Update') {
  try {
    const git = simpleGit(localPath);
    await git.add('.');
    await git.commit(commitMessage);
    await git.push();
    return true;
  } catch (error) {
    console.error('Push error:', error);
    throw error;
  }
}

async function pullChanges(localPath) {
  try {
    const git = simpleGit(localPath);
    await git.pull();
    return true;
  } catch (error) {
    console.error('Pull error:', error);
    throw error;
  }
}

async function getRepos(accessToken) {
  try {
    const response = await axios.get('https://api.github.com/user/repos', {
      headers: {
        'Authorization': `token ${accessToken}`,
        'Accept': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Get repos error:', error);
    throw error;
  }
}

async function createFork(accessToken, repoFullName) {
  try {
    const response = await axios.post(
      `https://api.github.com/repos/${repoFullName}/forks`,
      {},
      {
        headers: {
          'Authorization': `token ${accessToken}`,
          'Accept': 'application/json'
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Fork error:', error);
    throw error;
  }
}

module.exports = {
  createGithubRepo,
  cloneRepo,
  pushChanges,
  pullChanges,
  getRepos,
  createFork
};
